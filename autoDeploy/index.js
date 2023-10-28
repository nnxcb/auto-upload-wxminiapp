// index.js
const shell = require('shelljs');
const ci = require('miniprogram-ci');
const appid = require('../project.config.json').appid;
const pkg = require('../package.json');

const desc = '小程序上传';
console.log('process.cwd() ==>', process.cwd());
// const arguments = process.argv.splice(2);
// console.log('------小程序环境------', arguments[0]);

const projectCi = new ci.Project({
  appid,
  type: 'miniProgram',
  projectPath: process.cwd(),
  privateKeyPath: process.cwd() + '/autoDeploy/private.key',
  ignores: ['node_modules/**/*']
});

async function commit() {
  const _gitLog = await getLog();
  return Object.assign({}, _gitLog, {
    message:
      _gitLog.message.split(':')[1] || _gitLog.message.split('：')[1] || desc
  });
}

function getLog() {
  let _cmd = `git log --no-merges -1 \
  --date=iso --pretty=format:'{"author": "%aN","message": "%s"},' \
  $@ | \
  perl -pe 'BEGIN{print "["}; END{print "]\n"}' | \
  perl -pe 's/},]/}]/'`;
  return new Promise((resolve, reject) => {
    shell.exec(_cmd, (code, stdout, stderr) => {
      if (code) {
        reject(stderr);
      } else {
        const obj = Object.assign({}, JSON.parse(stdout)[0], {
          branch: shell.exec('git symbolic-ref --short -q HEAD').stdout
        });
        resolve(obj);
      }
    });
  });
}

module.exports = {
  projectName: pkg.name, // 项目名，用于后台设置的账号密码匹配
  version: pkg.version, // 本次发布的版本号
  desc: `小程序环境：dev`, // 上传备注信息
  projectCi,
  commit
};
