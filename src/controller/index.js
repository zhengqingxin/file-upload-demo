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

};
