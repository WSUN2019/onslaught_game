export default class MapManager {
    static getPathPoints() {
        // Connector curves are bezier-sampled waypoints so enemies follow the
        // curved road visually.  Control points used:
        //   Right (x=930): C1=(1030, 837), C2=(1030, 513)
        //   Left  (x=150): C1=(50,  487), C2=(50,  163)
        return [
            { x: 150,  y: 850 },
            { x: 930,  y: 850 },
            // ── right connector: curves outward to the right ──────────────
            { x: 986,  y: 795 },
            { x: 1005, y: 675 },
            { x: 986,  y: 555 },
            // ─────────────────────────────────────────────────────────────
            { x: 930,  y: 500 },
            { x: 150,  y: 500 },
            // ── left connector: curves outward to the left ────────────────
            { x:  94,  y: 445 },
            { x:  75,  y: 325 },
            { x:  94,  y: 205 },
            // ─────────────────────────────────────────────────────────────
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
