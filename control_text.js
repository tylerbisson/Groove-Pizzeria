function setPizza(pizza, weight){
    return function setSliders(l_anchor, r_anchor){
        return(
            [   
                `strokeWeight(${weight});`, 
                `fill(${pizza}.color[0], ${pizza}.color[1], ${pizza}.color[2], 150)`,
                function control_text(value, size, x_offset, y_offset) {
                    return (
                        [
                            `textSize(${size})`,
                            `text("${value}", ${pizza}.${l_anchor} - ${trans} - ${x_offset}, 
                            ${pizza}.${r_anchor} - ${trans} - ${y_offset})`
                        ]
                    )
                }
            ]
        )
    }
}

function showControlText(...pizzas){
    pizzas.forEach(pizza => {
        let setSliders = setPizza(`${pizza.name}`, 0);
            let control_text = setSliders("slidersXPos", "sliceSliderYPos");
                eval(control_text[0]);
                eval(control_text[1]);
                let eval_text = control_text[2](pizza.sliceSlider.value(), 32, (appWidth * 0.031), (appWidth * 0.008));
                    eval(eval_text[0]);
                    eval(eval_text[1]);
                eval_text = control_text[2]("steps (1/" + pizza.stepFrac.toFixed(3) + " note)", 16, 0, (appWidth * 0.011));
                    eval(eval_text[0]);
                    eval(eval_text[1]);
            control_text = setSliders("slidersXPos", "toothSliderYPos");
                eval_text = control_text[2](pizza.toothSlider.value(), 32, (appWidth * 0.031), (appWidth * 0.008));
                    eval(eval_text[0]);
                    eval(eval_text[1]);
                eval_text = control_text[2]("÷", 19, 36, (appHeight * -0.012));
                    eval(eval_text[0]);
                    eval(eval_text[1]);
                eval_text = control_text[2]("time units (" + timeUnit.toFixed(3) + " s)", 16, 0, (appWidth * 0.011));
                    eval(eval_text[0]);
                    eval(eval_text[1]);
            control_text = setSliders("rotateSliderXPos", "rotateSliderYPos");
                eval_text = control_text[2](pizza.rotateSlider.value(), 32, (appWidth * 0.031), (appWidth * 0.008));
                    eval(eval_text[0]);
                    eval(eval_text[1]);
                eval_text = control_text[2]("step rotations", 16, 0, (appWidth * 0.011));
                    eval(eval_text[0]);
                    eval(eval_text[1]);
                eval_text = control_text[2]("step ", 16, (appWidth * 0.184), 0);
                    eval(eval_text[0]);
                    eval(eval_text[1]);
    })
        fill(170)
        text("= " + stepRatio.toFixed(3) + " x",
            pizzas[0].rotateSliderXPos - trans - (appWidth * 0.156), pizzas[0].rotateSliderYPos - trans);

        text("= " + stepRatio2.toFixed(3) + " x",
            pizzas[1].rotateSliderXPos - trans - (appWidth * 0.156), pizzas[1].rotateSliderYPos - trans);

        fill(pizzas[0].color[0], pizzas[0].color[1], pizzas[0].color[2], 170);
            text("step ", pizzas[1].rotateSliderXPos - trans - (appWidth * 0.098), pizzas[1].rotateSliderYPos - trans);

        fill(pizzas[1].color[0], pizzas[1].color[1], pizzas[1].color[2], 170);
        text("step ",
            pizzas[0].rotateSliderXPos - trans - (appWidth * 0.098), pizzas[0].rotateSliderYPos - trans);
}