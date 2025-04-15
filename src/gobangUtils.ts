export function runGobang(board: number[][], playerFlag: number, level: number,) {
    const game = new Game
    game.boardState.board = board
    game.myFlag = playerFlag
    game.enemyFlag = 3 - playerFlag
    const result = entrance(DEPTH, _INF, INF, game.myFlag, new coordinate, new coordinate, game)
    return { aiX: result.x, aiY: result.y, score: result.score }
}

const BOARD_SIZE = 12    // 棋盘大小
const EMPTY = 0          // 空位
const BLACK = 1          // 黑棋
const WHITE = 2          // 白棋
const INF = 2147483647   // 正无穷
const _INF = -2147483647 // 负无穷
const DEPTH = 5          // 搜索深度

const BOARD_MIDDLE_1 = Math.floor((BOARD_SIZE + 1) / 2) - 1
const BOARD_MIDDLE_2 = Math.floor(BOARD_SIZE / 2)

interface chessType {
    win5: number,   // 连五
    alive4: number, // 活4
    conti4: number, // 冲4
    alive3: number, // 活3
    conti3: number, // 眠3
    jump3: number,  // 跳3
    alive2: number, // 活2
    conti2: number, // 眠2
    jump2: number,  // 跳2
    alive1: number, // 活1
    conti1: number, // 眠1
}

// 坐标结构体
class coordinate {
    public x = -1;
    public y = -1;
    public score = 0;
    constructor(a = 0, b = 0, s = 0) {
        this.x = a;
        this.y = b;
        this.score = s;
    }
}

// 棋盘状态类
class BoardState {
    public board: number[][] = [] // 棋盘状态
    public state = 0              // 棋盘状态标识
    constructor() {
        this.board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0))
        this.board[BOARD_MIDDLE_1][BOARD_MIDDLE_1] = WHITE
        this.board[BOARD_MIDDLE_2][BOARD_MIDDLE_2] = WHITE
        this.board[BOARD_MIDDLE_2][BOARD_MIDDLE_1] = BLACK
        this.board[BOARD_MIDDLE_1][BOARD_MIDDLE_2] = BLACK
    }
    public arr_input(x: number, y: number, playerround: number) {
        this.board[x][y] = playerround // 在指定位置放置棋子
    }
}

class Game {
    public myFlag: number = 0 // 玩家棋子颜色（1: 黑棋，2: 白棋）
    public enemyFlag: number = 0 // AI 棋子颜色（1: 黑棋，2: 白棋）
    public draw: boolean = false // 是否平局
    public boardState: BoardState = new BoardState() // 棋盘状态
    constructor() {
        this.myFlag = 0
        this.enemyFlag = 0
        this.draw = false
    }
}

// 判断坐标是否在棋盘范围内
function judgeInRange(temp: coordinate): boolean {
    if (temp.x < 0)
        return false;
    if (temp.y < 0)
        return false;
    if (temp.x >= BOARD_SIZE)
        return false;
    if (temp.y >= BOARD_SIZE)
        return false;
    return true;
}

// 获取指定位置的棋子颜色
function getColor(target: coordinate, game: Game) {
    if (judgeInRange(target))
        return game.boardState.board[target.x][target.y];
    else
        return game.enemyFlag;
}

// 在指定位置放置棋子
/*void place(coordinate target, int player, Game &game) {
    game.MAP.board[target.x][target.y] = player;
}*/
// 在指定位置放置棋子
function place(target: coordinate, player: number, game: Game) {
    game.boardState.board[target.x][target.y] = player;
}

// 快速排序函数
function partition(s: coordinate[], high: number, low: number): number {
    const pi = s[high].score;
    let i = low;
    for (let j = low; j <= high - 1; j++) {
        if (s[j].score >= pi) {
            const temp = s[i];
            s[i] = s[j];
            s[j] = temp;
            i++;
        }
    }
    const temp = s[i];
    s[i] = s[high];
    s[high] = temp;
    return i;
}

function quickSort(s: coordinate[], high: number, low: number = 0) {
    if (low < high) {
        const pi = partition(s, high, low);
        quickSort(s, pi - 1, low);
        quickSort(s, high, pi + 1);
    }
}

// 返回p点dire方向上w距离的点
function Neighbor(temp: coordinate, dire: number, w: number): coordinate {
    const direction = [[1, 0], [0, 1], [1, 1], [1, -1]];
    const neighbor = new coordinate();
    neighbor.x = temp.x + w * direction[dire][0];
    neighbor.y = temp.y + w * direction[dire][1];
    return neighbor;
}

// 判断点在d距离内是否有邻居
function hasNeighbor(temp: coordinate, d: number, game: Game): boolean {
    // 找棋盘上有落子点d个距离内
    for (let i = 0; i < 4; i++) {
        for (let j = -d; j <= d; j++) {
            if (j !== 0) {
                const neighbor = Neighbor(temp, i, j);
                if (judgeInRange(neighbor) && getColor(neighbor, game))
                    return true;
            }
        }
    }
    return false;
}

// 获取指定方向上的情况
function analyzeDire(temp: coordinate, dire: number, player: number, beside: number[], game: Game): number {
    let length = 1;
    let i = -1;
    for (; ; i--) {
        const neighbor = Neighbor(temp, dire, i);
        if (judgeInRange(neighbor) && player === game.boardState.board[neighbor.x][neighbor.y])
            length++;
        else {
            for (let j = 0; j < 4; j++) {
                const neighbor = Neighbor(temp, dire, i - j);
                if (judgeInRange(neighbor))
                    beside[j] = game.boardState.board[neighbor.x][neighbor.y];
                else
                    beside[j] = 3 - player;
            }
            break;
        }
    }
    for (i = 1; ; i++) {
        const neighbor = Neighbor(temp, dire, i);
        if (judgeInRange(neighbor) && player === game.boardState.board[neighbor.x][neighbor.y])
            length++;
        else {
            for (let j = 0; j < 4; j++) {
                const neighbor = Neighbor(temp, dire, i + j);
                if (judgeInRange(neighbor))
                    beside[4 + j] = game.boardState.board[neighbor.x][neighbor.y];
                else
                    beside[4 + j] = 3 - player;
            }
            break;
        }
    }
    return length;
}

function typeAnalysis(p: coordinate, dire: number, player: number, game: Game): chessType {
    const b: number[] = [0, 0, 0, 0, 0, 0, 0, 0];                                    // beside
    let length = analyzeDire(p, dire, player, b, game); // 获取p点连子的长度和两边延伸4子的信息
    const temp: chessType = {
        win5: 0,
        alive4: 0,
        conti4: 0,
        alive3: 0,
        conti3: 0,
        jump3: 0,
        alive2: 0,
        conti2: 0,
        jump2: 0,
        alive1: 0,
        conti1: 0,
    }
    if (length >= 5)
        temp.win5++;
    else if (length == 4) {
        if (b[0] == 0)
            if (b[4] == 0)
                temp.alive4++; // 011110
            else
                temp.conti4++; // 011112
        else if (b[4] == 0)
            temp.conti4++; // 211110
    } else if (length == 3) {
        if (b[0] == 0) {
            if (b[4] == 0) {
                if (b[1] == player) {
                    if (b[5] == player)
                        temp.conti4 += 2; // 1011101
                    else if (b[5] == player)
                        temp.conti4++; // 101110x
                } else if (b[5] == player)
                    temp.conti4++; // x011101
                else if (b[5] == 0 || b[1] == 0)
                    temp.alive3++; // x01110x
                else
                    temp.conti3++; // 2011102
            } else if (b[1] == player)
                temp.conti4++; // 101112x
            else if (b[1] == 0)
                temp.conti3++; // 001112x
        } else if (b[4] == 0) {
            if (b[5] == player)
                temp.conti4++; // x211101
            else
                temp.conti3++; // x211100
        }
    } else if (length == 2) {
        if (b[0] == 0) {
            if (b[4] == 0) {
                if (b[1] == player) {
                    if (b[5] == player) {
                        if (b[2] == player) {
                            if (b[6] == player)
                                temp.conti4 += 2; // 11011011
                            else
                                temp.conti4++; // 1101101x
                        } else if (b[2] == 0) {
                            if (b[6] == player)
                                temp.conti4++; // 01011011
                            else
                                temp.jump3++; // 0101101x
                        } else {
                            if (b[6] == player)
                                temp.conti4++; // 21011011
                            else if (b[6] == 0)
                                temp.jump3++; // 21011010
                            else
                                temp.conti3++; // 21011012
                        }
                    } else {
                        if (b[2] == player)
                            temp.conti4++; // 110110xx
                        else if (b[2] == 0)
                            temp.jump3++; // 010110xx
                        else
                            temp.conti3++; // 210110xx
                    }
                } else if (b[1] == 0) {
                    if (b[5] == player) {
                        if (b[6] == player)
                            temp.conti4++; // x0011011
                        else if (b[6] == 0)
                            temp.jump3++; // x0011010
                        else
                            temp.conti3++; // x0011012
                    } else
                        temp.alive2++; // x00110xx
                } else {
                    if (b[5] == player) {
                        if (b[6] == player)
                            temp.conti4++; // x2011011
                        else if (b[6] == 0)
                            temp.jump3++; // x2011010
                        else
                            temp.conti3++; // x2011012
                    } else if (b[5] == 0)
                        temp.alive2++; // x201100x
                }
            } else {
                if (b[1] == player) {
                    if (b[2] == player)
                        temp.conti4++; // 110112xx
                    else if (b[2] == 0)
                        temp.conti3++; // 010112xx
                } else if (b[1] == 0) {
                    if (b[2] == player)
                        temp.conti3++; // 100112xx
                    else if (b[2] == 0)
                        temp.conti2++; // 000112xx
                }
            }
        } else if (b[4] == 0) {
            if (b[5] == player) {
                if (b[6] == player)
                    temp.conti4++; // xx211011
                else if (b[6] == 0)
                    temp.conti3++; // xx211010
            } else if (b[5] == 0) {
                if (b[6] == player)
                    temp.conti3++; // xx211001
                else if (b[6] == 0)
                    temp.conti2++; // xx211000
            }
        }
    } else {
        if (b[0] == 0) {
            if (b[4] == 0) {
                if (b[1] == player) {
                    if (b[5] == player) {
                        if (b[2] == player) {
                            if (b[6] == player) {
                                if (b[3] == player) {
                                    if (b[7] == player)
                                        temp.conti4 += 2; // 111010111
                                    else
                                        temp.conti4++; // 11101011x
                                } else if (b[3] == 0) {
                                    if (b[7] == player || b[7] == 0)
                                        temp.conti4++; // 011010111/0
                                    else
                                        temp.jump3++; // 011010112
                                } else {
                                    if (b[7] == player)
                                        temp.conti4++; // 211010111
                                    else if (b[7] == 0)
                                        temp.jump3++; // 211010110
                                    else
                                        temp.conti3++; // 211010112
                                }
                            } else {
                                if (b[3] == player)
                                    temp.conti4++; // 1110101xx
                                else if (b[3] == 0)
                                    temp.jump3++; // 0110101xx
                                else
                                    temp.conti3++; // 2110101xx
                            }
                        } else if (b[2] == 0) {
                            if (b[6] == player) {
                                if (b[7] == player)
                                    temp.conti4++; // x01010111
                                else if (b[7] == 0)
                                    temp.jump3++; // x01010110
                                else
                                    temp.conti3++; // x01010112
                            } else
                                temp.jump2++; // x010101xx
                        } else {
                            if (b[6] == player) {
                                if (b[7] == player)
                                    temp.conti4++; // x21010111
                                else if (b[7] == 0)
                                    temp.jump3++; // x21010110
                                else
                                    temp.conti3++; // x21010112
                            } else if (b[6] == 0)
                                temp.jump2++; // x2101010x
                            else
                                temp.conti3++; // x2101012x
                        }
                    } else {
                        if (b[2] == player) {
                            if (b[3] == player)
                                temp.conti4++; // 1110102xx
                            else if (b[3] == 0)
                                temp.jump3++; // 0110102xx
                            else
                                temp.conti3++; // 2110102xx
                        } else if (b[2] == 0)
                            temp.jump2++; // x010102xx
                        else
                            temp.conti2++; // x210102xx
                    }
                } else {
                    if (b[5] == player)
                        if (b[6] == player) {
                            if (b[7] == player)
                                temp.conti4++; // xxx010111
                            else if (b[7] == 0)
                                temp.jump3++; // xxx010110
                            else
                                temp.conti3++; // xxx010112
                        } else if (b[6] == 0)
                            temp.jump2++; // xxx01010x
                        else
                            temp.conti2++; // xxx01012x
                    else
                        temp.alive1++; // xxx0102xx
                }
            } else {
                if (b[1] == player) {
                    if (b[2] == player) {
                        if (b[3] == player)
                            temp.conti4++; // 111012xxx
                        else if (b[3] == 0)
                            temp.conti3++; // 011012xxx
                    } else if (b[2] == 0) {
                        if (b[3] == player)
                            temp.conti3++; // 101012xxx
                        else if (b[3] == 0)
                            temp.conti2++; // 001012xxx
                    }
                } else
                    temp.conti1++; // xxx012xxx
            }
        } else {
            if (b[4] == 0) {
                if (b[5] == player) {
                    if (b[6] == player) {
                        if (b[7] == player)
                            temp.conti4++; // xxx210111
                        else if (b[7] == 0)
                            temp.conti3++; // xxx210110
                    } else if (b[6] == 0) {
                        if (b[7] == player)
                            temp.conti3++; // xxx210101
                        else if (b[7] == 0)
                            temp.conti2++; // xxx210100
                    }
                } else if (b[5] == 0) {
                    if (b[6] == player) {
                        if (b[7] == player)
                            temp.conti3++; // xxx210011
                        else if (b[7] == 0)
                            temp.conti2++; // xxx210010
                    } else if (b[6] == 0) {
                        if (b[7] == player)
                            temp.conti2++; // xxx210001
                        else if (b[7] == 0)
                            temp.conti1++; // xxx210000
                    }
                }
            }
        }
    }
    return temp;
}

// 单点得分
function singleScore(p: coordinate, player: number, game: Game): number {
    const chesstype = typeAnalysis(p, 0, player, game);
    for (let i = 1; i < 4; i++) {
        const temp = typeAnalysis(p, i, player, game);
        chesstype.win5 += temp.win5;
        chesstype.alive4 += temp.alive4;
        chesstype.conti4 += temp.conti4;
        chesstype.alive3 += temp.alive3;
        chesstype.conti3 += temp.conti3;
        chesstype.jump3 += temp.jump3;
        chesstype.alive2 += temp.alive2;
        chesstype.conti2 += temp.conti2;
        chesstype.jump2 += temp.jump2;
        chesstype.alive1 += temp.alive1;
        chesstype.conti1 += temp.conti1;
    }
    if (chesstype.win5) // 胜
        return 1048576;
    let score = ((chesstype.conti4 << 12) +
        (chesstype.alive3 << 12) + (chesstype.conti3 << 8) + (chesstype.jump3 << 10) +
        (chesstype.alive2 << 8) + (chesstype.conti2 << 3) + (chesstype.jump2 << 6) +
        (chesstype.alive1 << 3) + chesstype.conti1);
    if (chesstype.alive3 >= 2 || (chesstype.conti4 && chesstype.alive3) || chesstype.alive4 || chesstype.conti4 >= 2) // 必胜?
        score += 65536;
    return score;
}

// 棋盘整体局面分
function wholeScore(player: number, game: Game) {
    let Score = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const temp = new coordinate(i, j, game.boardState.board[i][j]);
            if (temp.score == 0)
                continue;
            if (temp.score == player) {
                Score += singleScore(temp, player, game); // 己方落子的单点分相加
            } else
                Score -= singleScore(temp, 3 - player, game); // 对方落子的单点分相加
        }
    }
    return Score; // 己方总分减对方总分 得到当前对己方来说的局势分
}

// 启发性搜索
function inspireSearch(scoreBoard: coordinate[], player: number, game: Game) {
    let length = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (game.boardState.board[i][j] == 0) {
                const temp = new coordinate(i, j, 0);
                if (hasNeighbor(temp, 3, game)) {
                    scoreBoard[length] = temp;
                    scoreBoard[length].score = singleScore(temp, 3 - player, game);
                    scoreBoard[length].score += singleScore(temp, player, game);
                    length++;
                }
            }
        }
    }
    // 对 scoreBoard 进行排序
    quickSort(scoreBoard, length - 1);
    // 找到最高分数
    let maxScore = scoreBoard[0].score;
    if (maxScore < 5)
        game.draw = true;
    const threshold = maxScore / 3;
    // 找到分界线
    let boundary = 1;
    for (let i = 1; i < length; i++) {
        if (scoreBoard[i].score <= threshold) {
            boundary = i; // 更新分界线位置
            break;        // 分数低于阈值，跳出循环
        }
    }
    // 更新 length 为分界线的位置
    length = boundary;
    // 返回 length，最多不超过
    return length > 10 ? 10 : length;
}

// 负极大极小值搜索
function alphaBeta(depth: number, alpha: number, beta: number, player: number, command: coordinate, current: coordinate, game: Game): coordinate {
    //let temp = JSON.parse(JSON.stringify(command)) as coordinate;
    let temp = new coordinate(command.x, command.y, command.score)
    if (depth == 0) {
        temp.score = wholeScore(player, game);
        return temp;
    }
    const steps: coordinate[] = new Array<coordinate>(BOARD_SIZE * BOARD_SIZE);
    let length = inspireSearch(steps, player, game); // 搜索可落子点
    if (length > 7 && depth > 1)
        depth--;
    else if (length > 2)
        depth--;
    for (let i = 0; i < length; i++) {
        place(steps[i], player, game);                                               // 模拟落子
        temp = alphaBeta(depth, -beta, -alpha, 3 - player, steps[i], command, game); // 取负值并交换alpha和beta
        temp.score *= -1;
        place(steps[i], 0, game); // 还原落子
        if (temp.score >= beta) {
            temp.score = beta;
            return temp; // 剪枝
        }
        if (temp.score > alpha)
            alpha = temp.score;
    }
    temp.score = alpha;
    return temp;
}

// 搜索入口
function entrance(depth: number, alpha: number, beta: number, player: number, command: coordinate, current: coordinate, game: Game) {
    const steps: coordinate[] = new Array<coordinate>(BOARD_SIZE * BOARD_SIZE)
    let temp = new coordinate;
    let best = new coordinate;
    let length = inspireSearch(steps, player, game); // 搜索可落子点
    if (length == 1 || game.draw)
        return steps[0];
    for (let i = 0; i < length; i++) {
        place(steps[i], player, game);                                               // 模拟落子
        temp = alphaBeta(depth, -beta, -alpha, 3 - player, steps[i], command, game); // 递归
        temp.score *= -1;
        place(steps[i], 0, game); // 还原落子
        if (temp.score > alpha) {
            alpha = temp.score;
            best = steps[i]; // 记录最佳落子
        }
    }
    best.score = alpha;
    return best;
}

