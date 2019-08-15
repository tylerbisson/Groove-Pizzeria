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
                let eval_text = control_text[2](pizza.sliceSlider.value(), Math.ceil(appWidth * .0269), (appWidth * 0.031), (appWidth * 0.003));
                    eval(eval_text[0]);
                    eval(eval_text[1]);
        eval_text = control_text[2]("steps (1/" + pizza.stepFrac.toFixed(3) + " note)", Math.ceil(appWidth * .0134), 0, (appWidth * 0.006));
                    eval(eval_text[0]);
                    eval(eval_text[1]);
            control_text = setSliders("slidersXPos", "toothSliderYPos");
                eval_text = control_text[2](pizza.toothSlider.value(), Math.ceil(appWidth * .0269), (appWidth * 0.031), (appWidth * 0.003));
                    eval(eval_text[0]);
                    eval(eval_text[1]);
                eval_text = control_text[2]("÷", Math.ceil(appWidth * 0.016), 36, (appHeight * -0.022));
                    eval(eval_text[0]);
                    eval(eval_text[1]);
                eval_text = control_text[2]("time units (" + timeUnit.toFixed(3) + " s)", Math.ceil(appWidth * .0134), 0, (appWidth * 0.006));
                    eval(eval_text[0]);
                    eval(eval_text[1]);
            control_text = setSliders("rotateSliderXPos", "rotateSliderYPos");
                eval_text = control_text[2](pizza.rotateSlider.value(), Math.ceil(appWidth * .0269), (appWidth * 0.031), (appWidth * 0.003));
                    eval(eval_text[0]);
                    eval(eval_text[1]);
                eval_text = control_text[2]("step rotations", Math.ceil(appWidth * .0134), 0, (appWidth * 0.006));
                    eval(eval_text[0]);
                    eval(eval_text[1]);
                eval_text = control_text[2]("step ", Math.ceil(appWidth * .0134), (appWidth * 0.184), 0);
                    eval(eval_text[0]);
                    eval(eval_text[1]);
    })
        fill(170)
        text("= " + stepRatio.toFixed(3) + " x",
            pizzas[0].rotateSliderXPos - trans - (appWidth * 0.156), pizzas[0].rotateSliderYPos - trans);

        text("= " + stepRatio2.toFixed(3) + " x",
            pizzas[1].rotateSliderXPos - trans - (appWidth * 0.156), pizzas[1].rotateSliderYPos - trans);

        fill(pizzas[0].color[0], pizzas[0].color[1], pizzas[0].color[2], 170);
            text("step ", pizzas[1].rotateSliderXPos - trans - (appWidth * 0.090), pizzas[1].rotateSliderYPos - trans);

        fill(pizzas[1].color[0], pizzas[1].color[1], pizzas[1].color[2], 170);
        text("step ",
            pizzas[0].rotateSliderXPos - trans - (appWidth * 0.090), pizzas[0].rotateSliderYPos - trans);
}