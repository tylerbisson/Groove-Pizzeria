function showControlText(p, ...pizzas) {
  pizzas.forEach((pizza) => {
    if (!pizza || !pizza.position || !pizza.dimensions) {
      console.error(`Invalid pizza object:`, pizza);
      return;
    }

    const textSize = Math.ceil(pizza.dimensions.appWidth * 0.0269); // Original scaling for text size
    const offsetX = pizza.dimensions.appWidth * 0.031; // Original horizontal offset
    const offsetY = pizza.dimensions.appWidth * 0.003; // Original vertical offset

    // Slice Slider
    p.strokeWeight(0);
    p.fill(...pizza.color, 150);
    p.textSize(textSize);
    p.text(
      pizza.sliceSlider.value(),
      pizza.position.x - offsetX,
      pizza.position.y - offsetY
    );
    p.text(
      pizza.stepFrac
        ? `steps (1/${pizza.stepFrac.toFixed(3)} note)`
        : "steps (undefined note)",
      pizza.position.x,
      pizza.position.y + offsetY * 2
    );

    // Tooth Slider
    p.text(
      pizza.toothSlider.value(),
      pizza.position.x - offsetX,
      pizza.position.y + offsetY * 4
    );
    p.text(
      `÷`,
      pizza.position.x - offsetX * 0.97,
      pizza.position.y + offsetY * 4.5
    );
    p.text(
      p.timeUnit
        ? `time units (${p.timeUnit.toFixed(3)} s)`
        : "time units (undefined s)",
      pizza.position.x,
      pizza.position.y + offsetY * 6
    );

    // Rotate Slider
    p.text(
      pizza.rotateSlider.value(),
      pizza.position.x - offsetX,
      pizza.position.y + offsetY * 8
    );
    p.text(
      `step rotations`,
      pizza.position.x,
      pizza.position.y + offsetY * 10
    );
    p.text(
      `step`,
      pizza.position.x + offsetX * 6,
      pizza.position.y + offsetY * 8
    );
  });

  // Step Ratio Text
  p.fill(170);
  if (pizzas[0]) {
    p.text(
      p.stepRatio ? `= ${p.stepRatio.toFixed(3)} x` : "= undefined x",
      pizzas[0].position.x - pizzas[0].dimensions.appWidth * 0.156,
      pizzas[0].position.y
    );
  }
  if (pizzas[1]) {
    p.text(
      p.stepRatio2 ? `= ${p.stepRatio2.toFixed(3)} x` : "= undefined x",
      pizzas[1].position.x - pizzas[1].dimensions.appWidth * 0.156,
      pizzas[1].position.y
    );
  }

  // Step Text for Pizzas
  if (pizzas[0] && pizzas[1]) {
    p.text(
      `step`,
      pizzas[1].position.x - pizzas[1].dimensions.appWidth * 0.085,
      pizzas[1].position.y,
      pizzas[0].color
    );
    p.text(
      `step`,
      pizzas[0].position.x - pizzas[0].dimensions.appWidth * 0.085,
      pizzas[0].position.y,
      pizzas[1].color
    );
  }
}

export { showControlText };