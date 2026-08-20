/** Natural-language flow: stepAI model — each Step N has navigate + check sub-steps. */
(function () {
  const NAV_MARKERS = ["navigate", "open ", "go to", "visit", "click", "enter", "select ", "type ", "browse", "load ", "launch"];
  const CHECK_MARKERS = ["verify", "check", "confirm", "assert", "ensure", "visible", "displayed", "should see", "expect"];

  function classifyAction(text) {
    const lower = (text || "").toLowerCase();
    const isNav = NAV_MARKERS.some((m) => lower.includes(m));
    const isCheck = CHECK_MARKERS.some((m) => lower.includes(m));
    if (isNav && !isCheck) return "navigate";
    if (isCheck && !isNav) return "check";
    if (isNav && isCheck) {
      if (/^(navigate|open|go to|click|enter|select|type|browse)/.test(lower)) return "navigate";
      return "check";
    }
    return "navigate";
  }

  function emptyStep(title) {
    return {
      title: title || "New step",
      navigate: "",
      check: "",
    };
  }

  /** Legacy groups[] → steps[] (pair navigate + check under one outer step). */
  function migrateGroupsToSteps(groups) {
    if (!Array.isArray(groups) || !groups.length) return [emptyStep("Primary flow")];
    const steps = [];
    groups.forEach((g) => {
      const actions = g.actions || [];
      if (!actions.length) {
        steps.push(emptyStep(g.name || "Step"));
        return;
      }
      for (let i = 0; i < actions.length; i += 2) {
        const first = actions[i];
        const second = actions[i + 1];
        let navigate = "";
        let check = "";
        if (first && second) {
          if (first.kind === "check" && second.kind === "navigate") {
            check = first.text || "";
            navigate = second.text || "";
          } else {
            navigate = first.text || "";
            check = second.text || "";
          }
        } else if (first) {
          if (first.kind === "check") check = first.text || "";
          else navigate = first.text || "";
        }
        const title =
          i === 0
            ? g.name || "Step"
            : `${g.name || "Step"} (${Math.floor(i / 2) + 1})`;
        steps.push({ title, navigate, check });
      }
    });
    return steps.length ? steps : [emptyStep("Primary flow")];
  }

  /** Normalize stored case data to { steps: [...] }. */
  function normalizeModel(raw) {
    if (!raw) return { steps: [emptyStep("Primary flow")] };

    if (Array.isArray(raw.steps)) {
      return {
        steps: raw.steps.map((s) => ({
          title: s.title || "Step",
          navigate: s.navigate || "",
          check: s.check || "",
        })),
      };
    }

    if (Array.isArray(raw.groups)) {
      return { steps: migrateGroupsToSteps(raw.groups) };
    }

    return { steps: [emptyStep("Primary flow")] };
  }

  function parseGivenWhenThen(text) {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const gwtLines = lines.filter((l) => /^(Given|When|Then|And)\s/i.test(l));
    if (gwtLines.length < 2) return null;
    const navigateParts = [];
    const checkParts = [];
    gwtLines.forEach((line) => {
      if (/^Then|And.*(?:verify|check|confirm|assert|visible|shows?)/i.test(line)) {
        checkParts.push(line);
      } else {
        navigateParts.push(line);
      }
    });
    return {
      steps: [
        {
          title: "Scenario",
          navigate: navigateParts.join("\n"),
          check: checkParts.join("\n"),
        },
      ],
    };
  }

  function parseFlow(raw) {
    const text = (raw || "").trim();
    if (!text) return { steps: [emptyStep("Primary flow")] };

    try {
      const parsed = JSON.parse(text);
      if (parsed && Array.isArray(parsed.steps)) return normalizeModel(parsed);
      if (parsed && Array.isArray(parsed.groups)) return normalizeModel(parsed);
      if (Array.isArray(parsed)) {
        return normalizeModel({
          groups: parsed.map((g) => ({
            name: g.name || g.title || "Step",
            actions: (g.instructions || g.actions || []).map((line) => ({
              kind: classifyAction(String(line)),
              text: String(line),
            })),
          })),
        });
      }
    } catch (_) {}

    const steps = [];
    let current = null;

    function flush() {
      if (!current) return;
      steps.push({
        title: current.title || "Step",
        navigate: current.navigate || "",
        check: current.check || "",
      });
      current = null;
    }

    for (const rawLine of text.split("\n")) {
      const line = rawLine.trim();
      if (!line) continue;

      const numbered = line.match(/^(\d+)\.\s*(.+)$/);
      if (numbered) {
        flush();
        current = { title: numbered[2].trim(), navigate: "", check: "" };
        continue;
      }

      const bullet = line.match(/^[-*]\s+(.+)$/);
      const actionText = bullet ? bullet[1].trim() : line;

      if (!current) {
        current = { title: "Primary flow", navigate: "", check: "" };
      }

      const kind = classifyAction(actionText);
      if (kind === "check" && current.check) {
        current.check += `\n${actionText}`;
      } else if (kind === "check" && !current.check) {
        current.check = actionText;
      } else if (current.navigate && !current.check && kind === "navigate") {
        current.navigate += `\n${actionText}`;
      } else if (!current.navigate) {
        current.navigate = actionText;
      } else if (!current.check) {
        current.check = actionText;
      } else {
        flush();
        current = {
          title: actionText.slice(0, 48) || "Step",
          navigate: actionText,
          check: "",
        };
      }
    }
    flush();

    if (!steps.length) {
      const gwt = parseGivenWhenThen(text);
      if (gwt) return gwt;
      return {
        steps: [
          {
            title: "Primary flow",
            navigate: text,
            check: "",
          },
        ],
      };
    }

    return { steps };
  }

  function serializeFlow(model) {
    const m = normalizeModel(model);
    const lines = [];
    m.steps.forEach((s, i) => {
      lines.push(`${i + 1}. ${s.title || "Step"}`);
      if (s.navigate && s.navigate.trim()) lines.push(`- ${s.navigate.trim()}`);
      if (s.check && s.check.trim()) lines.push(`- ${s.check.trim()}`);
    });
    return lines.join("\n").trim();
  }

  /** Flat list for references — one entry per outer step (stepAI). */
  function flattenSteps(model) {
    const m = normalizeModel(model);
    return m.steps.map((s, i) => ({
      stepNumber: i + 1,
      title: s.title,
      navigate: s.navigate,
      check: s.check,
    }));
  }

  /** @deprecated use flattenSteps */
  function flattenActions(model) {
    const flat = [];
    flattenSteps(model).forEach((s) => {
      if (s.navigate && s.navigate.trim()) {
        flat.push({
          stepNumber: s.stepNumber,
          groupName: s.title,
          kind: "navigate",
          text: s.navigate,
        });
      }
      if (s.check && s.check.trim()) {
        flat.push({
          stepNumber: s.stepNumber,
          groupName: s.title,
          kind: "check",
          text: s.check,
        });
      }
    });
    return flat;
  }

  function flowIsComplete(model) {
    return flattenSteps(model).every(
      (s) =>
        s.title &&
        s.title.trim() &&
        s.navigate &&
        s.navigate.trim() &&
        s.check &&
        s.check.trim()
    );
  }

  function buildDefaultFromText(description) {
    const topic = (description || "Primary flow").trim();
    return {
      steps: [
        {
          title: `Navigate to feature area for: ${topic}`,
          navigate: `Navigate to the application entry point for ${topic}`,
          check: "Verify the starting screen is visible and ready (not a blank page or error state)",
        },
        {
          title: `Execute user flow: ${topic}`,
          navigate: `Perform the primary user action described: ${topic}`,
          check: "Verify the expected outcome is displayed and matches acceptance criteria",
        },
      ],
    };
  }

  function buildAskiiExample() {
    return {
      steps: [
        {
          title: "Navigate to Askii and verify UI",
          navigate: "Navigate to https://sandbox.askii.ai",
          check:
            "Verify the Askii application interface is displayed (not a blank page or login screen, and no Login button visible)",
        },
        {
          title: "Browse to Prompts listing",
          navigate: 'Click on "Prompts" in the left sidebar navigation menu',
          check:
            "Verify the prompts listing page is displayed showing a grid or list of available prompts",
        },
        {
          title: "Open a prompt detail page",
          navigate:
            "Click on a random prompt card in the list (not the first one unless there is only one)",
          check:
            "Verify the prompt detail page is displayed showing the full prompt content, title, and action buttons",
        },
      ],
    };
  }

  function normalizeCaseFlow(caseObj) {
    let model;
    if (caseObj.flowSteps) {
      if (Array.isArray(caseObj.flowSteps) && caseObj.flowSteps[0]?.navigate !== undefined) {
        model = { steps: caseObj.flowSteps };
      } else if (Array.isArray(caseObj.flowSteps) && caseObj.flowSteps[0]?.actions) {
        model = normalizeModel({ groups: caseObj.flowSteps });
      } else {
        model = normalizeModel({ steps: caseObj.flowSteps });
      }
    } else {
      model = parseFlow(caseObj.flow || "");
    }
    model = normalizeModel(model);
    return {
      ...caseObj,
      flowSteps: model.steps,
      flow: serializeFlow(model),
    };
  }

  /** Common 20-step guest checkout E2E — one outer Step per stepAI() call. */
  function buildTwentyStepCheckout(topic) {
    const t = topic || "guest purchase";
    return {
      steps: [
        { title: "Open storefront homepage", navigate: "Navigate to the store homepage", check: "Verify the homepage loads with navigation, search, and featured products visible" },
        { title: "Dismiss cookie consent", navigate: "Click Accept on the cookie consent banner if shown", check: "Verify the banner is dismissed and page content is fully interactive" },
        { title: "Search for a product", navigate: 'Type "wireless earbuds" in the search field and submit', check: "Verify search results page shows at least one matching product" },
        { title: "Open product detail page", navigate: "Click the first in-stock product from search results", check: "Verify product title, price, variant options, and Add to cart button are visible" },
        { title: "Select product variant", navigate: "Select color Black and size Standard if variant pickers are present", check: "Verify selected variant is reflected in price and availability state" },
        { title: "Add item to cart", navigate: 'Click "Add to cart"', check: "Verify cart badge increments and add-to-cart confirmation appears" },
        { title: "Open cart summary", navigate: "Open the cart drawer or navigate to the cart page", check: "Verify line item, quantity, subtotal, and checkout CTA are displayed" },
        { title: "Update line quantity", navigate: "Change quantity to 2 and wait for totals to refresh", check: "Verify subtotal and quantity reflect the updated amount" },
        { title: "Proceed to checkout", navigate: 'Click "Checkout" as a guest (continue without account)', check: "Verify shipping step loads with address form fields" },
        { title: "Enter shipping address", navigate: "Fill shipping address with valid test data and continue", check: "Verify address validation passes and shipping method step is shown" },
        { title: "Select shipping method", navigate: "Choose Standard shipping and continue", check: "Verify shipping cost is added to order summary" },
        { title: "Enter contact email", navigate: "Enter guest email address on the contact step", check: "Verify email field accepts input and no format error is shown" },
        { title: "Enter payment details", navigate: "Fill card number, expiry, and CVC with test payment data", check: "Verify payment fields validate and billing section is complete" },
        { title: `Apply promotion for ${t}`, navigate: "Expand promo code field and enter a valid test coupon", check: "Verify discount line appears in order summary when coupon is valid" },
        { title: "Review order summary", navigate: "Open order review section before placing order", check: "Verify items, shipping, tax, discount, and total match expected values" },
        { title: "Accept terms and conditions", navigate: "Check the terms and conditions checkbox", check: "Verify Place order button becomes enabled" },
        { title: "Place order", navigate: 'Click "Place order"', check: "Verify order confirmation page shows order number and thank-you message" },
        { title: "Verify confirmation details", navigate: "Scroll through confirmation page sections", check: "Verify shipping address, payment method summary, and line items are listed" },
        { title: "Open order history", navigate: "Navigate to account order history (guest lookup or session)", check: "Verify the new order appears at the top of the order list" },
        { title: "Validate order status", navigate: "Open the order detail for the placed order", check: "Verify status is Processing or Confirmed and matches confirmation totals" },
      ],
    };
  }

  /** Legacy alias */
  function emptyGroup(name) {
    return {
      name: name || "Step group",
      actions: [
        { kind: "navigate", text: "" },
        { kind: "check", text: "" },
      ],
    };
  }

  window.QopsNlFlow = {
    classifyAction,
    parseFlow,
    serializeFlow,
    flattenSteps,
    flattenActions,
    flowIsComplete,
    buildDefaultFromText,
    buildAskiiExample,
    buildTwentyStepCheckout,
    normalizeCaseFlow,
    normalizeModel,
    migrateGroupsToSteps,
    emptyStep,
    emptyGroup,
  };
})();
