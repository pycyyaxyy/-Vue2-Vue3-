//在实际开发中基本上都是对于对象的响应式

//定义一个存储响应式的函数的数组
// const reactiveFns = []; //这里是依赖于name的响应式函数的存放所在地

//但是很明显不合适，如果每个属性的相关响应式函数都放在相应的数组中，则需要定义好多好多数组

//所以最好搞一个类来封装

class Depend {
  constructor() {
    this.reactiveFns = [];
  }

  addDepend(fn) {
    this.reactiveFns.push(fn);
  }

  notify() {
    this.reactiveFns.forEach((fn) => {
      fn();
    });
  }
}

//监听需要产生响应式的函数
const depend = new Depend(); //相当于对应的name的depend对象
function watchFn(fn) {
  depend.addDepend(fn);
}

//测试对象
const info = {
  name: "kobe", //每一个属性都会对应一个depend对象
  age: 18,
};

watchFn(function () {
  console.log(1231);
  console.log(info.name);
  function hello(name) {
    console.log(`你好啊${name}`);
  }
  hello(info.name);
});

info.name = "james";
depend.notify();
