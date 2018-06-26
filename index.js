const mysql = require('mysql');

const getBrowser = require('./browser');

const browsers = [
  ['NetcraftSurveyAgent', /NetcraftSurveyAgent/],
  ['Googlebot', /Googlebot/],
  ['YandexBot', /YandexBot/],
  ['SogouSpider', /Sogou web spider/],
  ['bingbot', /bingbot/],
  ['Baiduspider', /Baiduspider/],
  ['BingPreview', /BingPreview/],
  ['Edge', /Edge/i],
  ['UC浏览器', /UCWEB/],
  ['Opera', /Opera/],
  ['遨游', /Maxthon/i],
  ['Theworld', /TheWorld/],
  ['Firefox', /Firefox/],
  ['腾讯浏览器', /TencentTraveler|QQBrowser/],
  ['360浏览器', /360SE/],
  ['搜狗浏览器', /MetaSr/],
  ['Avant', /Avant/],
  ['IE浏览器', /MSIE|Trident/],
  ['Chrome Android', /Android/],
  ['Chrome', /Chrome/],
  ['Safari Mobile', /Mobile.+Safari/],
  ['Safari', /Safari/],
  ['Other Mobile', /Mobile/],
];

// url: 'mysql://justin:some_pass@localhost:3306/fdd_operation'

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'justin',
  password : 'some_pass',
  database : 'test'
});

connection.connect();
let total = 0;
let cursor = 0;
let perLimit = 1000;
const table = 'user_trace_web_01_delete_big_ip_distinct_fa';

function matchBrowser(userAgent) {
  let matched = '';
  for (let i = 0; i < browsers.length; i++) {
    let browser = browsers[i];
    if (browser[1].test(userAgent)) {
      matched = browser[0];
      break;
    }
  }
  return matched;
}

async function getRows(cursor1, limit = 1) {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT id, user_agent FROM ${table} limit ${cursor1},${limit}`, async function (error, results, fields) {
      if (error) throw error;
      // console.log('The solution is: ', results[0]);
      resolve(results);
    });
  })
}

async function updateRow(id, browser) {
  return new Promise((resolve, reject) => {
    connection.query(`UPDATE ${table} SET browser = ? WHERE id = ?`, [browser, id], async function (error, results, fields) {
      if (error) throw error;
      resolve();
    });
  })
}

async function updateTenRows(cursor2) {
  let max = cursor + perLimit > total ? total : cursor + perLimit;
  let rows = await getRows(cursor2, perLimit);
  let matched;
  try {
    matched = rows.map((row) => getBrowser(row.user_agent).browser);
  } catch (e) {
    console.error(e);
  }

  let promises = [];

  for (let i = 0; i < matched.length; i++) {
    if (matched[i]) {
      promises.push(updateRow(rows[i].id, matched[i]));
    }
  }

  await Promise.all(promises);
}

connection.query(`SELECT COUNT(*) as total FROM ${table}`, async function (error, results, fields) {
  if (error) throw error;
  // console.log('The solution is: ', results[0].total);
  total = results[0].total;
  console.log('Total is', total);
  console.time('hello');
  for (let i = 0; i < total; i += perLimit) {
    if (i % 10000 === 0) {
      console.log(i);
    }
    await updateTenRows(i);
  }
  console.timeEnd('hello');
  console.log('done');
});

// connection.end();
