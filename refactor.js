const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "src");

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith(".tsx") || file.endsWith(".ts")) results.push(file);
        }
    });
    return results;
}

const files = walk(dir);

files.forEach(file => {
    let content = fs.readFileSync(file, "utf8");

    // Text colors
    content = content.replace(/text-(violet|amber|emerald|sky|red|yellow|pink|purple|indigo)-400/g, "text-$1-600 dark:text-$1-400");
    content = content.replace(/text-(violet|amber|emerald|sky|red|yellow|pink|purple|indigo)-300/g, "text-$1-700 dark:text-$1-300");

    // Border colors
    content = content.replace(/border-(violet|amber|emerald|sky|red|yellow|pink|purple|indigo)-500\/20/g, "border-$1-500/30 dark:border-$1-500/20");

    fs.writeFileSync(file, content);
});

console.log("Refactored colors for light mode!");
