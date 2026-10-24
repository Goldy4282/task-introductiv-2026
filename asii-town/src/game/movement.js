import {COLS,isBlocked} from './world';
const distance=(x,y,a,b)=>Math.abs(x-a)+Math.abs(y-b);
const nextX=(x,d)=>x+(d===6?1:d===4?-1:0);
const nextY=(y,d)=>y+(d===2?1:d===8?-1:0);
const delta=(a,b)=>a-b;
const canPass=(x,y,d)=>!isBlocked(nextX(x,d),nextY(y,d));
export function findDirection(startTile,goalX,goalY){

    const searchLimit = 12;
    const mapWidth = COLS;
    const nodeList = [];
    const openList = [];
    const closedList = [];
    const start = {};
    let best = start;

    if (startTile.x === goalX && startTile.y === goalY) {
        return 0;
    }

    start.parent = null;
    start.x = startTile.x;
    start.y = startTile.y;
    start.g = 0;
    start.f = distance(start.x, start.y, goalX, goalY);
    nodeList.push(start);
    openList.push(start.y * mapWidth + start.x);

    while (nodeList.length > 0) {
        let bestIndex = 0;
        for (let i = 0; i < nodeList.length; i++) {
            if (nodeList[i].f < nodeList[bestIndex].f) {
                bestIndex = i;
            }
        }

        const current = nodeList[bestIndex];
        const x1 = current.x;
        const y1 = current.y;
        const pos1 = y1 * mapWidth + x1;
        const g1 = current.g;

        nodeList.splice(bestIndex, 1);
        openList.splice(openList.indexOf(pos1), 1);
        closedList.push(pos1);

        if (current.x === goalX && current.y === goalY) {
            best = current;
            break;
        }

        if (g1 >= searchLimit) {
            continue;
        }

        for (let j = 0; j < 4; j++) {
            const direction = 2 + j * 2;
            const x2 = nextX(x1, direction);
            const y2 = nextY(y1, direction);
            const pos2 = y2 * mapWidth + x2;

            if (closedList.includes(pos2)) {
                continue;
            }
            if (!canPass(x1, y1, direction)) {
                continue;
            }

            const g2 = g1 + 1;
            const index2 = openList.indexOf(pos2);

            if (index2 < 0 || g2 < nodeList[index2].g) {
                let neighbor = {};
                if (index2 >= 0) {
                    neighbor = nodeList[index2];
                } else {
                    nodeList.push(neighbor);
                    openList.push(pos2);
                }
                neighbor.parent = current;
                neighbor.x = x2;
                neighbor.y = y2;
                neighbor.g = g2;
                neighbor.f = g2 + distance(x2, y2, goalX, goalY);
                if (!best || neighbor.f - neighbor.g < best.f - best.g) {
                    best = neighbor;
                }
            }
        }
    }

    let node = best;
    while (node.parent && node.parent !== start) {
        node = node.parent;
    }

    const deltaX1 = delta(node.x, start.x);
    const deltaY1 = delta(node.y, start.y);
    if (deltaY1 > 0) {
        return 2;
    } else if (deltaX1 < 0) {
        return 4;
    } else if (deltaX1 > 0) {
        return 6;
    } else if (deltaY1 < 0) {
        return 8;
    }

    const deltaX2 = (startTile.x-goalX);
    const deltaY2 = (startTile.y-goalY);
    if (Math.abs(deltaX2) > Math.abs(deltaY2)) {
        return deltaX2 > 0 ? 4 : 6;
    } else if (deltaY2 !== 0) {
        return deltaY2 > 0 ? 8 : 2;
    }

    return 0;

}
