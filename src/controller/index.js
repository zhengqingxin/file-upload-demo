const Base = require('./base.js');
const path = require('path');
const fs = require('fs');
const rename = think.promisify(fs.rename, fs);
module.exports = class extends Base {
  indexAction() {
    return this.display();
  }

  async uploadAction() {
    const file = this.file('file');
    if(file) {
      try{
        const filePath = path.join(think.ROOT_PATH, `runtime/upload/${Date.now()}${path.extname(file.name)}`);
        think.mkdir(path.dirname(filePath));
        await rename(file.path, filePath);
        return this.success();
      }catch(e){
        return this.fail();
      }
    }
    return this.fail();
  }

  async chunkUploadAction(){
    const file = this.file('file');
    const order = this.post('order');
    if(file){
      try{
        // 每个分片名前加 ${order}-，合并的时候也会按顺序取出分片
        const filePath = path.join(think.ROOT_PATH, `runtime/upload/${file.name}`,`${order}-${think.uuid()}`);
        think.mkdir(path.dirname(filePath));
        await rename(file.path, filePath);    
        return this.success(filePath);
      }catch(e){
        return this.fail();
      }
    }
  }

  async mergeChunkAction(){
    const {uuid,mType} = this.post();
    if(!uuid){
      return this.fail();
    }
    try{
      const chunkDir = path.join(think.ROOT_PATH, `runtime/upload/${uuid}/`);
      const desPath = path.join(think.ROOT_PATH, `runtime/upload/${Date.now()}.${mType}`);
      let fileList = [];
      // 遍历分片文件
      fs.readdirSync(chunkDir).forEach(file => {
        fileList.push(chunkDir + file);
      })
      
      // 合并
      for (var i = 0, len = fileList.length; i < len; i++) {  
        fs.appendFileSync(desPath, fs.readFileSync(fileList[i]));
      }

      child_process.exec(['rm', '-rf', chunkDir].join(' '));

      return this.success();
    }catch(e){
      return this.fail();
    }
  }
};
