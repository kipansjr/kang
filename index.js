console.clear();
const axios = require('axios');
const figlet = require('figlet');
require('@colors/colors');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const url = 'http://api.netvance.fun/capcut';

const headers = {
  Authorization: `Bearer ${config.capcutApi.bearer}`
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

figlet('NETVANCECAPCUT', (err, banner) => {
  if (err) {
    console.error('❌ Failed to generate banner');
    return;
  }

  console.log(banner.rainbow);

  rl.question('🔢 How many accounts do you want to generate? ', async (input) => {
    const jumlah = parseInt(input) || 1;
    console.log(`\n⏳ Generating ${jumlah} account(s)...`.cyan);

    const params = {
      password: config.capcutApi.password,
      proxyusername: config.capcutApi.proxyusername,
      proxypassword: config.capcutApi.proxypassword,
      proxyhost: config.capcutApi.proxyhost,
      proxyport: config.capcutApi.proxyport,
      jumlah
    };

    try {
      const response = await axios.get(url, { params, headers });
      const akunList = response.data.akun;

      if (Array.isArray(akunList) && akunList.length > 0) {
        console.log(`\n✅ ${akunList.length} account(s) created successfully!\n`.green);

        // Prepare file output
        const outputPath = path.join(__dirname, 'data', 'accounts.txt');
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });

        const lines = akunList.map((akun, i) => {
          console.log(`#${i + 1}`.yellow);
          console.log(`📧 EMAIL    : ${akun.email}`.cyan);
          console.log(`🔑 PASSWORD : ${config.capcutApi.password}\n`.cyan);
          return `#${i + 1}\nEMAIL: ${akun.email}\nPASSWORD: ${config.capcutApi.password}\n`;
        }).join('\n');

        fs.writeFileSync(outputPath, lines, 'utf8');
        console.log(`📝 Account list saved to: ${outputPath}`.gray);
      } else {
        console.log('⚠️ No account data received from the server.'.red);
      }
    } catch (error) {
      console.error('❌ Failed to fetch account data:'.red, error.message);
      if (error.response?.data) {
        console.error('📨 Server Response:', JSON.stringify(error.response.data, null, 2));
      }
    } finally {
      rl.close();
    }
  });
});