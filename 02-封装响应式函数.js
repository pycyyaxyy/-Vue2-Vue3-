//在实际开发中基本上都是对于对象的响应式

//定义一个存储响应式的函数的数组
const reactiveFns = [];

//定义一个函数，参数为需要执行的响应式的函数
function watchFn(Fn) {
  reactiveFns.push(Fn);
}

const info = {
  name: "jay",
  age: 18,
};

//这里下面是我想要做到的(当name发生改变的时候)
//比如这个函数是我需要响应式调用的
function foo() {
  console.log(1231);
  console.log(info.name);
  function hello(name) {
    console.log(`你好啊${name}`);
  }
  hello(info.name);
}

//我把这个需要产生响应式的函数直接给他传进去
watchFn(foo);

//或者我还有一个需要产生响应式的函数
watchFn(function demo() {
  console.log("无敌是多么的寂寞~~~~", info.name);
});

//下面这个函数不是我需要响应式调用的
function baz() {
  console.log("再见了我的爱");
}

//当属性发生修改后，想要使得与这个属性相关的函数再执行一遍
info.name = "james";
reactiveFns.forEach((fn) => fn());
