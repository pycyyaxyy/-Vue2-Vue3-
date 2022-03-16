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

//总的weakMap，键名是每个对象，值是每个对象对应的map
const targetMap = new WeakMap();

//获取每个对象的属性的依赖
function getDepend(obj, key) {
  let map = targetMap.get(obj);
  if (!map) {
    map = new Map();
    targetMap.set(obj, map);
  }

  let depend = map.get(key);
  if (!depend) {
    depend = new Depend();
    map.set(key, depend);
  }
  return depend;
}

// Vue3——自动收集依赖
const proxyInfo = new Proxy(info, {
  get(target, key, receiver) {
    return Reflect.get(target, key, receiver);
  },

  set(target, key, newValue, receiver) {
    Reflect.set(target, key, newValue, receiver);
    // depend.notify();
    const depend = getDepend(target, key);
    console.log(depend.reactiveFns);
    depend.notify();
  },
});

watchFn(function () {
  console.log(1231);
  console.log(proxyInfo.name);
  function hello(name) {
    console.log(`你好啊${name}`);
  }
  hello(proxyInfo.name);
});

proxyInfo.name = "james0";
proxyInfo.name = "james1";
proxyInfo.name = "james2";
proxyInfo.name = "james3";
