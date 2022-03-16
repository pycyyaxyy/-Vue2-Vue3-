//在实际开发中基本上都是对于对象的响应式

const info = {
  name: "jay",
  age: 18,
};

//这里下面是我想要做到的(当name发生改变的时候)
console.log(1231);
console.log(info.name);
function hello(name) {
  console.log(`你好啊${name}`);
}

info.name = "james";
