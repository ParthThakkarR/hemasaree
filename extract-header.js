const fs = require('fs');

const html = fs.readFileSync('d:\\hemasaree\\server_html.txt', 'utf8');
const headerMatch = html.match(/<header[^>]*>.*?<\/header>/i);

if (headerMatch) {
  console.log("FOUND HEADER:");
  // very basic formatting just to see tags
  let formatted = headerMatch[0].replace(/>/g, '>\n').replace(/</g, '\n<');
  console.log(formatted);
} else {
  console.log("HEADER NOT FOUND");
}
