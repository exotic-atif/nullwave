const fs = require('fs')
const path = require('path')

const filesToPatch = [
  path.join(__dirname, '..', 'node_modules', '@applemusic-like-lyrics', 'core', 'dist', 'amll-core.cjs'),
  path.join(__dirname, '..', 'node_modules', '@applemusic-like-lyrics', 'core', 'dist', 'amll-core.mjs'),
]

let patchedCount = 0

for (const filePath of filesToPatch) {
  if (!fs.existsSync(filePath)) continue

  let code = fs.readFileSync(filePath, 'utf8')
  let modified = false

  // 1. Guard against infinite while loop in calcBalancedBreaks
  const buggyLoop = 'while (curr < n) {\n\t\tcurr = nextBreak[curr];\n\t\tif (curr > 0 && curr < n) breaks.push(curr);\n\t}'
  const safeLoop = 'let _guard = 0;\n\twhile (curr < n && _guard++ < n + 10) {\n\t\tconst next = nextBreak[curr];\n\t\tif (next <= curr || next === undefined) break;\n\t\tcurr = next;\n\t\tif (curr > 0 && curr < n) breaks.push(curr);\n\t}'

  if (code.includes(buggyLoop)) {
    code = code.replace(buggyLoop, safeLoop)
    modified = true
  }

  // 2. Also guard calcBalancedBreaks on narrow containerWidth <= 10
  const buggyWidthCheck = 'if (n === 0 || containerWidth <= 0) return [];'
  const safeWidthCheck = 'if (n === 0 || containerWidth <= 10) return [];'

  if (code.includes(buggyWidthCheck)) {
    code = code.replace(buggyWidthCheck, safeWidthCheck)
    modified = true
  }

  if (modified) {
    fs.writeFileSync(filePath, code, 'utf8')
    patchedCount++
    console.log(`[NullWave Patch] Successfully secured ${path.basename(filePath)} against infinite loops.`)
  } else {
    console.log(`[NullWave Patch] ${path.basename(filePath)} already patched or clean.`)
  }
}

console.log(`[NullWave Patch] Completed (${patchedCount} files patched).`)
