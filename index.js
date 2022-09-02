// 项目难点
// 1. 容器分割， 16 宫格概念
// 2. 观察块元素的位置变化， 找出其中的规律
// 3. 判断块元素与元素之间的碰撞
// 4. 判断一行被铺满的情况

// 16 宫格 原理
// 旋转原理
// 移动后的行 === 移动前的列
// 移动后的列 === 3- 移动前的行

// 常量
// 每次移动的距离
let STEP = 30;

/** 是否结束 */
let isGameOverFlag = true;

/** 按键位置 */
const KEY_CODE = {
  LEFT: 37,
  TOP: 38,
  RIGHT: 39,
  BOTTOM: 40,
};

/** 消除一行的分数 */
const CLEAR_ROW_SCORE = 5;

/** 得分 */
let score = 0;

/** 分割容器
 * 分割成几行几列
 * 方便16宫格
 */
let ROW_COUNT = 27,
  COL_COUNT = 15;

/**
 * 根据16宫格原理创建相对应模型的数据源
 */
const MODELS = [
  // 第一个模型数据源（L型）
  {
    0: {
      row: 2,
      col: 0,
    },

    1: {
      row: 2,
      col: 1,
    },
    2: {
      row: 2,
      col: 2,
    },
    3: {
      row: 1,
      col: 2,
    },
  },
  // 第二个样式（凸）
  {
    0: {
      row: 1,
      col: 1,
    },

    1: {
      row: 0,
      col: 0,
    },
    2: {
      row: 1,
      col: 0,
    },
    3: {
      row: 2,
      col: 0,
    },
  },
  // （田）
  {
    0: {
      row: 1,
      col: 1,
    },

    1: {
      row: 2,
      col: 1,
    },
    2: {
      row: 1,
      col: 2,
    },
    3: {
      row: 2,
      col: 2,
    },
  },
  // （一）
  {
    0: {
      row: 0,
      col: 0,
    },

    1: {
      row: 0,
      col: 1,
    },
    2: {
      row: 0,
      col: 2,
    },
    3: {
      row: 0,
      col: 3,
    },
  },
  // Z
  {
    0: {
      row: 1,
      col: 1,
    },

    1: {
      row: 1,
      col: 2,
    },
    2: {
      row: 2,
      col: 2,
    },
    3: {
      row: 2,
      col: 3,
    },
  },
];

/** 创建模型颜色 */
const COLOR_LIST = ["#f2dc00", "#d9e97c", "#237cb1", "#d7441b", "#a962d2"];

// 创建下落定时器
let downInterval = null;
// 下落速度
let downSpeed = 800;

// 记录固定底部的块元素
// key = 行_列 ：V=  块元素
let fixedBottomBlock = {};

// 当前的模型
let currentModel = {};

// 16 宫格 初始 x ,y
let panelGridX = 0,
  panelGridY = 0;

// 根据模型数据创建对应的块元素
const createModel = () => {
  if (isGameOver()) {
    gameOver();
    return;
  }
  // 16 宫格初始化
  panelGridX = 0;
  panelGridY = 0;
  // 确定当前使用那个模型
  // 生成0-4 的随机整数
  const randomNum = Math.round(Math.random() * 4);

  currentModel = MODELS[randomNum];
  for (const key in currentModel) {
    const divEle = document.createElement("div");
    divEle.className = "wrapper-active";
    if (isMobile()) {
      divEle.classList.add("phone");
    }
    document.querySelector(".tetris-wrapper").appendChild(divEle);
    // divEle.style.backgroundColor = COLOR_LIST[randomNum];
  }
  locationBlocks();

  setDownSpeed();
  // 自动下落
  autoDown();
};

// 根据数据源定义块元素的位置
const locationBlocks = () => {
  // 边界检测
  checkBound();
  // 1. 拿到所有块元素
  const eles = document.querySelectorAll(".wrapper-active");
  eles.forEach((ele, index) => {
    const blockModel = currentModel[index];
    ele.style.top = (blockModel.row + panelGridY) * STEP + "px";
    ele.style.left = (blockModel.col + panelGridX) * STEP + "px";
  });
};

// 监听键盘事件
const onKeyDown = function () {
  document.onkeydown = (event) => {
    switch (event.keyCode) {
      case KEY_CODE.LEFT: {
        leftDown(event);
        break;
      }
      case KEY_CODE.TOP: {
        rotateModel();
        break;
      }
      case KEY_CODE.RIGHT: {
        rightDown(event);
        break;
      }
      case KEY_CODE.BOTTOM: {
        bottomDown(event);
        break;
      }
    }
  };
};

const leftDown = (event) => {
  keyDownMove(-1, 0);
};

const rightDown = (event) => {
  keyDownMove(1, 0);
};
const topDown = (event) => {
  keyDownMove(0, -1);
};
const bottomDown = (event) => {
  keyDownMove(0, 1);
};

// 按键坐标轴移动原理
// 左 （-1，0）
// 右边 （1，0）
// 上 （0 ，-1）
// 下 （0，1）

const keyDownMove = (x, y) => {
  if (isGameOverFlag) return;
  // const getActiveEle = document.querySelector('.wrapper-active');
  // console.log('getActiveEle',getActiveEle.style.top)
  // const savePreLeft = parseInt(getActiveEle.style.left || 0);
  // const svvePreTop = parseInt(getActiveEle.style.top || 0);

  // // 移动计算
  // getActiveEle.style.top = svvePreTop + (y * STEP) + 'px';
  // getActiveEle.style.left =savePreLeft + (x * STEP) + 'px';
  if (isMeet(panelGridX + x, panelGridY + y, currentModel)) {
    if (y !== 0) {
      fixedBottomModel();
    }
    return;
  }

  panelGridX += x;
  panelGridY += y;
  locationBlocks();
};

const setDownSpeed = () => {
  switch (score) {
    case score === 50: {
      downSpeed = 400;
      break;
    }
    case score === 100: {
      downSpeed = 300;
      break;
    }
    case score === 200: {
      downSpeed = 200;
      break;
    }
    default: {
      return;
    }
  }
};

const rotateModel = () => {
  // 旋转原理
  // 移动后的行 === 移动前的列
  // 移动后的列 === 3- 移动前的行

  // 克隆 当前数据源
  const cloneCurrentModel = JSON.parse(JSON.stringify(currentModel));
  for (const key in cloneCurrentModel) {
    const currentBlocks = cloneCurrentModel[key];
    const temp = currentBlocks.row;
    currentBlocks.row = currentBlocks.col;
    currentBlocks.col = 3 - temp;
  }

  if (isMeet(panelGridX, panelGridY, cloneCurrentModel)) {
    return;
  }
  currentModel = cloneCurrentModel;

  locationBlocks();
};

// 检测是否越界
const checkBound = () => {
  const leftBound = 0,
    rightBound = COL_COUNT,
    bottomBound = ROW_COUNT;

  // 获取所有块元素
  for (const key in currentModel) {
    if (Object.hasOwnProperty.call(currentModel, key)) {
      const element = currentModel[key];
      // 左侧判断
      if (element.col + panelGridX < leftBound) {
        panelGridX++;
      }
      // 右侧判断
      if (element.col + panelGridX >= rightBound) {
        panelGridX--;
      }

      // 下边界检测
      if (element.row + panelGridY >= bottomBound) {
        panelGridY--;
        fixedBottomModel();
      }
    }
  }
};

// 将模型固定在底部
const fixedBottomModel = () => {
  // 1. 将元素样式修改
  // 2. 让模型不可以移动
  const eles = document.querySelectorAll(".wrapper-active");
  eles.forEach((ele, index) => {
    ele.className = "wrapper-disabled";
    if (isMobile()) {
      ele.classList.add("phone");
    }
    const block = currentModel[index];
    fixedBottomBlock[panelGridY + block.row + "_" + (panelGridX + block.col)] =
      ele;
  });

  // 判断是否被铺满
  isRemoveLine();

  // 3. 创建新的模型
  createModel();
};

// 判断块之间的碰撞关系
// x,y 将要移动的位置
// model 当前模型数据源将要完成的变化
const isMeet = (x, y, model) => {
  // 一个位置不能同时占用
  // 在将要移动的时机进行判断
  for (const key in model) {
    if (Object.hasOwnProperty.call(model, key)) {
      const block = model[key];

      if (fixedBottomBlock[y + block.row + "_" + (x + block.col)]) {
        return true;
      }
    }
  }
  return false;
};

// 判断一行是否被铺满
const isRemoveLine = () => {
  // 在一行中，每一列都存在块就是占满了
  // 遍历所有行中的所有列

  for (let i = 0; i < ROW_COUNT; i++) {
    // 假设占满
    let flag = true;
    for (let j = 0; j < COL_COUNT; j++) {
      if (!fixedBottomBlock[i + "_" + j]) {
        flag = false;
        break;
      }
    }
    if (flag) {
      removeLine(i);
    }
  }
};

// 删除被铺满的行
const removeLine = (line) => {
  const scoreEle = document.querySelector(".tetris-score");
  score += CLEAR_ROW_SCORE;
  const eles = document.querySelector(".tetris-wrapper");
  for (let i = 0; i < COL_COUNT; i++) {
    eles.removeChild(fixedBottomBlock[line + "_" + i]);
    fixedBottomBlock[line + "_" + i] = null;
  }
  downLine(line);
  scoreEle.innerHTML = score;
};

/** 让被清理的行数之上的所有块元素下落 */
const downLine = (line) => {
  // 1. 让所有之上的块元素行数 + 1
  // 2. 让块元素在容器的位置下落
  // 3. 清理掉之前的块

  for (let i = line - 1; i >= 0; i--) {
    for (let j = 0; j < COL_COUNT; j++) {
      if (!fixedBottomBlock[i + "_" + j]) continue;
      // 存在数据
      // 1. 让所有之上的块元素行数 + 1
      fixedBottomBlock[i + 1 + "_" + j] = fixedBottomBlock[i + "_" + j];

      fixedBottomBlock[i + 1 + "_" + j].style.top = (i + 1) * STEP + "px";
      fixedBottomBlock[i + "_" + j] = null;
    }
  }
};

/** 重置dom元素 */
const resetDom = () => {
  const scoreEle = document.querySelector(".tetris-score");
  const wrapperEle = document.querySelector(".tetris-wrapper");

  wrapperEle.innerHTML = "";
  scoreEle.innerHTML = 0;
};

/** 自动下落 */
const autoDown = () => {
  if (downInterval) {
    clearInterval(downInterval);
  }
  downInterval = setInterval(() => {
    keyDownMove(0, 1);
  }, downSpeed);
};

/** 游戏结束 */
const isGameOver = () => {
  // 当第0 行有块元素的时候
  for (let i = 0; i < COL_COUNT; i++) {
    if (fixedBottomBlock["0_" + i]) {
      return true;
    }
  }
  return false;
};

/** 结束掉游戏 */
const gameOver = () => {
  isGameOverFlag = true;
  // 结束定时器
  if (downInterval) {
    clearInterval(downInterval);
  }
  // 弹出对话框
  alert(`游戏结束，您的得分： ${score} 分,请再接再厉！`);
};

/** 重置初始数据 */
const resetInitData = () => {
  score = 0;
  panelGridX = 0;
  panelGridY = 0;
  downInterval = null;
  fixedBottomBlock = {};
  currentModel = {};
};

/** 重新开始 */
const reset = () => {
  isGameOverFlag = false;
  if (downInterval) {
    clearInterval(downInterval);
  }
  const stopEle = document.querySelector(".actions-stop");
  stopEle.innerHTML = "暂停";

  resetInitData();
  resetDom();
  init();
};

/** 暂停/继续 */
const stopAndContinue = () => {
  const stopEle = document.querySelector(".actions-stop");
  if (downInterval) {
    clearInterval(downInterval);
    downInterval = null;
    stopEle.innerHTML = "继续";
    return;
  }
  stopEle.innerHTML = "暂停";
  autoDown();
};

/** 开始 */
const start = () => {
  if (isGameOverFlag) {
    reset();
  }
};

/** 获取设备 */
const isMobile = () => {
  let flag =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  return flag;
};

/** 移动端 数据修改 */
const isMobileData = () => {
  (ROW_COUNT = 23), (COL_COUNT = 17);
  downSpeed = 500;
  STEP = 20;
  const phoneEle = document.querySelector(".tetris-phone");

  phoneEle.classList.remove("none");
  addClassPhone();
};

const addClassPhone = () => {
  const bodyEle = document.querySelector("body");
  const tetrisEle = document.querySelector("#tetris ");
  const wrapperEle = document.querySelector(".tetris-wrapper");
  const countEle = document.querySelector(".tetris-count");
  const actionEle = document.querySelector(".tetris-action");
  [tetrisEle, wrapperEle, countEle, actionEle, bodyEle].forEach((ele) => {
    ele.classList.add("phone");
  });
};

/** 初始化 */
const init = () => {
  onKeyDown();
  createModel();
};
