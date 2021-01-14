let {database} = require('./bootstrap');

(async ()=>{
  let result = null;
  try{
    
    let productDao = database.Product();

    // CHAR(10) newline \n //CHAR(13) return \r
    result = await productDao.sqlCommand(`select id, description_en from ${productDao.table} where description_en LIKE CONCAT ('%', CHAR(10), '%')`, null);

    let promises = [];
    result.forEach((r)=>{
      let replacement_description = r.description_en.replace(/\n/g, ", ");
      // console.log(replacement_description);
      promises.push( productDao.sqlCommand(`update ${productDao.table} set description_en = ? where id = ?`, [replacement_description, r.id]) );

    });

    console.log("Executing updates...");
    result = await Promise.all(promises);

    // console.log(JSON.stringify(result,null,2));
    console.log('%o records were processed', result.length);
  }catch(ex){
    console.error(ex);
  } finally {
    database.pool().end();
  }
})()