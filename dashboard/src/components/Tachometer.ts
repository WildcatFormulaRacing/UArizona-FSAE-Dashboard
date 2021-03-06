import { DashColors } from "../utils/dash-types";
import { MAX_RPM } from "../utils/dash-types";
import { linearScale } from "../utils/dash-utils";

/**
 * 
 */
export class Tachometer {
    // HTML ID
    private id: string;
    // canvas context
    private ctx: CanvasRenderingContext2D;

    /**
     * 
     * @param id 
     * @param context 
     */
    constructor(id: string, context: CanvasRenderingContext2D) {
        this.id = id;
        this.ctx = context;
        //set the intial background
        this.clearFrame();
        this.drawTicks();
    }

    /**
     * Sets the grey background and tick marks
     */
    private drawTicks() {
        for (let x = 60; x < 608; x += (608 / 10)) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 15);
            this.ctx.lineTo(x, 30);
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "black";
            this.ctx.stroke();
        }
    }

    private clearFrame() {
        this.ctx.clearRect(0, 0, 608, 50);
        this.ctx.fillStyle = DashColors.GREY;
        this.ctx.fillRect(0, 0, 608, 51);
    }

    setValue(rpm: number) {
        // clear the frame
        this.clearFrame()
        // change revbar color if its > 90 % of the max rpm
        if(rpm > MAX_RPM * 0.90) {
            this.ctx.fillStyle = DashColors.RED;
        } else {
            this.ctx.fillStyle = DashColors.ORANGE;
        }

        // map the rpm to pixels
        const fillWidth = linearScale(rpm, 0, MAX_RPM, 0, 608);
        // set the fill color
        this.ctx.fillRect(0, 0, fillWidth, 50);
        // redraw tick marks
        this.drawTicks();
    }
}