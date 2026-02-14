const https = require('https');

const apiKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiI1ZTJkNGU0YTE3ZWU4NGNjNTFiOTI2ZGM3Y2RhOTJkYmQ0MDFjOTAyYzg4NWM4NmIwN2U1NjIzYTY2ZGUwOTMwNTJlYTM5OGQ1ZmZlY2EyYiIsImlhdCI6MTc3MDk5MzI0OC4zNDE0MjQsIm5iZiI6MTc3MDk5MzI0OC4zNDE0MjcsImV4cCI6MTc4NjU3OTIwMC4wMzE3Niwic3ViIjoiNjEwNDI5NyIsInNjb3BlcyI6W119.iEGU5bqKgw_eR-toUU6xPn0U5AsF8R3sCF8k-9Csp-Mrw1SNP8OyX7ne2SHUqvqYE3Y37Dnvo85uqGgAzXGw6fb5-Rk4lyHoIFZD7JQ-B7O03nqnVvTGBHx7bT7st4af-G85QGcG0CLXK3sqcyseYNc35UdUm1zpr3AaIrg3t3gdmMlrgzi-GocXIqjQu-YJ0EySP96ftT72_UOQ8Xi3cCtU_56EKA03Q7VKMuI-INk4svL2GyL21KsxCA5zEvZ_YyYMpeO5i7LIpxF2wAW2fA2RB9g1EYLZ57xySAuZYTB9qJTRHm-W3vn8It4XrZ4uYpXuM7pxZk12iBanyHCpxI4_Kqnzs1krD3lUAywYijr8JtBefeFcYEogGEVnCjUXepM5wapCFHHtCBPEDtybF9sOcNi4xKLEmnvk6i7qmC7mBMfnN3fYPEggK10dKvXjUqRkJSgzRgnT65bnw8EYq07MmwZDvFhIA4lKxmOx58ms4RDTBMOO-lyyGDxwrn9ftGm6JLBmdJOrxqaJyV4ApvIyYYiVKCCz6OXedaaV6GB6l_-_dos5duX8mSLma8Sbq0-FijTEK3huaLojPzkz-DVnQfiuWJKjT3IoBNmkUyATRdg11tuFmIwk_CgbEh8pCNSyKUQhA_1EBstGtzOTS86I5M6VfMPkFX-Ndn6pExE';
const storeId = '253149';

const options = {
    hostname: 'api.lemonsqueezy.com',
    path: `/v1/variants`,
    method: 'GET',
    headers: {
        'Accept': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'Node.js'
    }
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            if (res.statusCode !== 200) {
                console.error(`Error: Status Code ${res.statusCode}`);
                console.error(data);
                return;
            }
            const json = JSON.parse(data);
            console.log('--- FOUND VARIANTS ---');
            json.data.forEach(v => {
                console.log(`Name: ${v.attributes.name}`);
                console.log(`Variant ID: ${v.id}`);
                console.log(`Price: $${v.attributes.price / 100}`);
                console.log('----------------');
            });
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
