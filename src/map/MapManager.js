export default class MapManager {
    static getPathPoints() {
        return [
            { x: 150,  y: 850 },
            { x: 930,  y: 850 },
            { x: 930,  y: 500 },
            { x: 150,  y: 500 },
            { x: 150,  y: 150 },
            { x: 930,  y: 150 },
        ];
    }

    static getLedgeYValues() {
        return [850, 500, 150];
    }

    // 3 build slots per ledge — evenly spaced across the walkable width
    static getSlotPositions() {
        const slots = [];
        const ledges = this.getLedgeYValues();
        const xPositions = [280, 540, 800];
        ledges.forEach((y, floorIndex) => {
            xPositions.forEach(x => {
                slots.push({ x, y, floorIndex, occupied: false });
            });
        });
        return slots;
    }
}
