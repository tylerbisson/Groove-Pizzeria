function setPizza(pizza, weight){
    return function setSliders(l_anchor, r_anchor){
        return(
            [   
                `strokeWeight(${weight});`, 
                `fill(${pizza}.color[0], ${pizza}.color[1], ${pizza}.color[2], 90)`,
                function control_text(value, size, x_offset, y_offset) {
                    return (
                        [
                            `textSize(${size})`,
                            `text("${value}", ${pizza}.${l_anchor} - 600 - ${x_offset}, 
                            ${pizza}.${r_anchor} - 600 - ${y_offset})`
                        ]
                    )
                }
            ]
        )
    }
}


