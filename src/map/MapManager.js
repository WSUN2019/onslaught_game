export default class MapManager {
    static getPathPoints() {
        // 45° diagonal ramps: Δx = Δy = 250 px
        // Bottom floor (y=860, x=0–830) → right ramp → Middle floor (y=610, x=250–1080)
        // Middle floor → left ramp → Top floor (y=360, x=0–830)
        return [
            { x:  50,  y: 860 },  // bottom floor spawn
            { x: 830,  y: 860 },  // bottom floor right end
            { x: 955,  y: 735 },  // right ramp mid
            { x:1080,  y: 610 },  // middle floor entry (right)
            { x: 250,  y: 610 },  // middle floor exit (left)
            { x: 125,  y: 485 },  // left ramp mid
            { x:   0,  y: 360 },  // top floor entry (left)
            { x: 790,  y: 360 },  // top floor exit
        ];
    }

    static getLedgeYValues() {
        return [860, 610, 360];
    }

    // Floor layout: [y, lx, lw]
    static getFloorData() {
        return [[860, 0, 830], [610, 250, 830], [360, 0, 830]];
    }

    static getSlotPositions() {
        const slots = [];
        // Bottom floor (x=0–830): 3 slots
        [210, 430, 650].forEach(x => slots.push({ x, y: 860, floorIndex: 0, occupied: false }));
        // Middle floor (x=250–1080): 3 slots
        [440, 660, 880].forEach(x => slots.push({ x, y: 610, floorIndex: 1, occupied: false }));
        // Top floor (x=0–830): 3 slots
        [180, 400, 620].forEach(x => slots.push({ x, y: 360, floorIndex: 2, occupied: false }));
        return slots;
    }
}
