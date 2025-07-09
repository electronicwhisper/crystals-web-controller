// Function to update preset via API
async function updatePreset(effect_id, preset_id) {
  const payload = {
    effect_id,
    preset_id,
  };

  try {
    console.log("Updating preset with:", payload);

    const response = await fetch("/api/preset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    console.log("Response status:", response.status);
    console.log("Response data:", result);

    if (response.ok) {
      console.log("✅ Preset update successful!");
      return { success: true, data: result };
    } else {
      console.log("❌ Preset update failed!");
      return { success: false, error: result };
    }
  } catch (error) {
    console.error("❌ Error updating preset:", error);
    return { success: false, error: error.message };
  }
}

// Test the function with the specified parameters
// updatePreset("power", "peach-out");

let dir = "up";
let effect = "power";
let preset = "peach";

function refresh() {
  console.log("Refreshing", effect, preset, dir);
  updatePreset(effect, preset + "-" + dir);

  // Update visual highlighting
  updateHighlighting();
}

function updateHighlighting() {
  // Remove all highlights first
  document.querySelectorAll(".dir, .pad").forEach((el) => {
    el.classList.remove("highlighted");
  });

  // Highlight current direction
  document.querySelectorAll(".dir").forEach((el) => {
    if (el.dataset.dir === dir) {
      el.classList.add("highlighted");
    }
  });

  // Highlight current pad
  document.querySelectorAll(".pad").forEach((el) => {
    if (el.dataset.effect === effect && el.dataset.preset === preset) {
      el.classList.add("highlighted");
    }
  });
}

document.querySelectorAll(".dir").forEach((el) => {
  el.addEventListener("pointerdown", () => {
    dir = el.dataset.dir;
    refresh();
  });
});

document.querySelectorAll(".pad").forEach((el) => {
  el.addEventListener("pointerdown", () => {
    effect = el.dataset.effect;
    preset = el.dataset.preset;
    refresh();
  });
});

// Initialize highlighting on page load
updateHighlighting();
