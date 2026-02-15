import { defineNuxtModule, addVitePlugin } from '@nuxt/kit'

interface PoliceOptions {
    enabled: boolean
    strict: boolean
}

declare module '@nuxt/schema' {
    interface NuxtConfig {
        police?: Partial<PoliceOptions>
    }
    interface NuxtOptions {
        police: PoliceOptions
    }
}

interface PoliceRule {
    pattern: RegExp
    title: string
    emoji: string
    message: string
}

const rules: PoliceRule[] = [
    {
        pattern: /\bvar\s+/,
        title: 'CRITICAL ERROR',
        emoji: '🦖',
        message: '"เกิดยุคไหนเนี่ย? ยุคจูราสสิคหรอ? อีแก่🦖"\nเลิกใช้ var ได้แล้ว! ใช้ let หรือ const เดี๋ยวนี้!'
    },
    {
        pattern: /export\s+default\s+\{\s*data\s*\(\)/,
        title: 'LEGACY DETECTED',
        emoji: '👴',
        message: '"นี่มันปี 2026 แล้วควย! จะเขียน Vue 2 ไปถึงไหน?"\nไปใช้ <script setup> ซะ ไอ้ไก่!'
    },
    {
        pattern: /from\s+['"]axios['"]/,
        title: 'FORBIDDEN MODULE',
        emoji: '🚫',
        message: '"Nuxt เขามี useFetch/ofetch ให้ใช้แล้วโว้ย!"\nจะโหลด axios ให้หนักเว็บทำไม? ไปลบออก!'
    },
    {
        pattern: /require\s*\(\s*["']axios["']\s*\)/,
        title: 'FORBIDDEN MODULE',
        emoji: '🚫',
        message: '"Nuxt เขามี useFetch/ofetch ให้ใช้แล้วโว้ย!"\nจะโหลด axios ให้หนักเว็บทำไม? ไปลบออก!'
    },
    {
        pattern: /from\s+['"]moment['"]/,
        title: 'BLOATWARE ALERT',
        emoji: '🐘',
        message: '"หนักเครื่อง! หนักเว็บ! หนักใจ!"\nไปใช้ day.js เถอะ กราบล่ะ คคคคคค 🙏'
    },
    {
        pattern: /from\s+['"]lodash['"]/,
        title: 'BLOATWARE ALERT',
        emoji: '📦',
        message: '"Lodash ทั้งก้อน!? จะเอาไปหาพ่อมึงหรอ?"\nถ้าจะใช้แค่ไม่กี่ฟังก์ชัน import เฉพาะตัวที่ใช้ เช่น lodash-es/debounce\nหรือเขียนเองเลย มันปี 2026 JS มี built-in เกือบหมดแล้ว!'
    },
    {
        pattern: /document\.(getElementById|querySelector|querySelectorAll|getElementsByClassName)\s*\(/,
        title: 'DOM MANIPULATION DETECTED',
        emoji: '🤮',
        message: '"ยังจิ้ม DOM ตรงอยู่อีก!? นี่ไม่ใช่ jQuery นะพี่!"\nใช้ ref/reactive แล้วจัดการผ่าน template ซะ!\nนี่คือ Vue ไม่ใช่ Vanilla JS!'
    },
    {
        pattern: /\$\(.*?\)/,
        title: 'ARCHAEOLOGICAL DISCOVERY',
        emoji: '⛏️',
        message: '"jQuery ในปี 2026!? คุณมึงขุดไซต์โบราณมาหรอ?"\nทิ้งควยเรามี Vue มี reactivity system ให้ใช้แล้ว\nไม่ต้อง $(\'.class\').hide() อีกต่อไป!'
    },
    {
        pattern: /eval\s*\(/,
        title: 'SECURITY BREACH',
        emoji: '💀',
        message: '"eval() !!? มึงจะทำควยอะไรนิ!?"\neval = evil! มีช่องโหว่ XSS ร้ายแรง!\nเอาออกเดี๋ยวนี้ก่อนจะโดน hack ไม่เอาออกเรื่องของมึง'
    },
    {
        pattern: /innerHTML\s*=/,
        title: 'XSS VULNERABILITY',
        emoji: '🕳️',
        message: '"innerHTML ตรงๆ จะเปิดช่องโหว่ XSS ให้แฮกเกอร์เล่นหรอ?"\nใช้ v-html ถ้าจำเป็นจริงๆ (และ sanitize ด้วย!)\nหรือดีกว่านั้น ใช้ template binding ไปเลย!'
    },
    {
        pattern: /console\.(log|warn|info|debug)\s*\(/,
        title: 'CONSOLE SPAM',
        emoji: '🗑️',
        message: '"console.log ทิ้งไว้!? Deploy ขึ้น production แบบนี้หรอ?"\nลบ console.log ออกซะ หรือใช้ logger ที่ปิดได้ใน production!\nมืออาชีพเขาไม่ทิ้ง debug log ไว้!'
    },
    {
        pattern: /new\s+Promise\s*\(\s*(?:async\s+)?\(?[^)]*\)?\s*=>\s*\{[\s\S]*?\}\s*\)/,
        title: 'PROMISE ANTIPATTERN',
        emoji: '🤦',
        message: '"สร้าง new Promise ครอบ async!? Antipattern ชัดๆ!"\nถ้ามี async function อยู่แล้ว return ค่าตรงๆ ได้เลย!\nมึงไม่ต้องมา new Promise ครอบอีกชั้น!'
    },
    {
        pattern: /==(?!=)/,
        title: 'LOOSE COMPARISON',
        emoji: '🎰',
        message: '"== !? จะเล่นการพนันกับ type coercion หรอ?"\n1 == "1" เป็น true นะรู้ยัง!?\nใช้ === เสมอ ไม่งั้นเจอ bug แปลกๆ แน่!'
    },
    {
        pattern: /!=(?!=)/,
        title: 'LOOSE COMPARISON',
        emoji: '🎰',
        message: '"!= !? เขียนโค้ดแบบแก้ผ้าหรอ?"\nใช้ !== เสมอ ปลอดภัยกว่า strict comparison ดีกว่า!'
    },
    {
        pattern: /\.then\s*\(.*\)\s*\.then/,
        title: 'CALLBACK HELL 2.0',
        emoji: '🍝',
        message: '"Promise chain ยาวเป็นงู!? 🐍"\n.then().then().then() อ่านยากมาก!\nใช้ async/await ซะ สะอาดกว่าเยอะ!'
    },
    {
        pattern: /any(?:\s*[;,)\]}]|\s*$)/m,
        title: 'TYPE SAFETY VIOLATION',
        emoji: '🏴‍☠️',
        message: '"any!? TypeScript มีไว้เพื่ออะไร ถ้าจะใช้ any!?"\nกำหนด type ให้ชัดเจน หรืออย่างน้อยใช้ unknown!\nเขียน any = เขียน JavaScript พร้อมขั้นตอนเพิ่ม!'
    },
    {
        pattern: /:\s*any\b/,
        title: 'TYPE SAFETY VIOLATION',
        emoji: '🏴‍☠️',
        message: '"ประกาศ type เป็น any!? แล้วจะใช้ TypeScript ทำไม!?"\nเขียน type ให้ชัดเจน ไม่งั้นไปเขียน JavaScript เถอะ!\nany คือการยอมแพ้ต่อ type system!'
    },
    {
        pattern: /@ts-ignore/,
        title: 'CRIME SCENE',
        emoji: '🚨',
        message: '"@ts-ignore!? ควยๆ"\nอย่าปิดตา TypeScript แล้วบอกว่าไม่มี bug!\nแก้ type ให้ถูก ไม่ใช่บอกให้ TS หุบปากไอ้ไก่!'
    },
    {
        pattern: /@ts-nocheck/,
        title: 'TOTAL ANARCHY',
        emoji: '🔥',
        message: '"@ts-nocheck!? ปิด TypeScript ทั้งไฟล์เลยหรอ!?"\nขนาดนี้ไปเปลี่ยนนามสกุลเป็น .js เลยดีกว่า!\nอย่ามาแกล้งทำเป็นเขียน TypeScript!'
    },
    {
        pattern: /setTimeout\s*\(\s*(?:function|\([^)]*\)\s*=>)\s*.*,\s*0\s*\)/,
        title: 'HACK DETECTED',
        emoji: '🩹',
        message: '"setTimeout(..., 0)!? เรียกว่าอะไรดี... band-aid fix?"\nแก้ปัญหาที่ต้นเหตุ อย่า hack ด้วย setTimeout 0!\nใช้ nextTick() ถ้าต้องรอ DOM update!'
    },
    {
        pattern: /style\s*=\s*["']\s*[^"']+["']/,
        title: 'INLINE STYLE DETECTED',
        emoji: '🎨',
        message: '"Inline style!? จะย้อนยุค HTML4 หรอ?"\nใช้ CSS class หรือ Tailwind ซะ!\nInline style = unmaintainable nightmare!'
    },
    {
        pattern: /!important/,
        title: 'CSS WAR CRIME',
        emoji: '⚔️',
        message: '"!important!? สงคราม CSS specificity เริ่มแล้ว!"\nถ้าต้องใช้ !important แสดงว่า CSS architecture พังแล้ว!\nจัดลำดับ specificity ใหม่ดีกว่า!'
    }
]

function buildErrorMessage(rule: PoliceRule, filePath: string): string {
    return `
    ${rule.emoji} [${rule.title}] ${rule.emoji}
    -----------------------------------------------------
    เจอของต้องห้ามในไฟล์: ${filePath}

    ${rule.message}
    -----------------------------------------------------
  `
}

export default defineNuxtModule({
    meta: {
        name: 'PaperX-police',
        configKey: 'police'
    },
    defaults: {
        enabled: true,
        strict: false
    },
    setup(options, nuxt) {
        if (!options.enabled) return

        nuxt.hook('listen', () => {
            console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║  PaperX Police กำลังลาดตระเวน...พวกไก่              ║
  ║  ห้ามเขียนโค้ดกาก เด็ดขาด!                        ║
  ║  Rules loaded: ${String(rules.length).padEnd(2)} rules                           ║
  ║  Mode: ${options.strict ? 'STRICT 🔴' : 'NORMAL 🟢'}                              ║
  ╚═══════════════════════════════════════════════════╝
      `)
        })

        addVitePlugin({
            name: 'paperx-troll-police',
            enforce: 'pre',
            transform(code: string, id: string) {
                // Skip node_modules and .nuxt internals
                if (id.includes('node_modules') || id.includes('.nuxt')) return

                // Skip non-source files
                if (!/\.(vue|ts|tsx|js|jsx|mts|cts)(\?|$)/.test(id)) return

                const violations: string[] = []

                for (const rule of rules) {
                    if (rule.pattern.test(code)) {
                        const errorMsg = buildErrorMessage(rule, id)
                        if (options.strict) {
                            throw new Error(errorMsg)
                        }
                        violations.push(errorMsg)
                    }
                }

                if (violations.length > 0) {
                    const summary = `
   PaperX Police Report 
  =====================================================
  ไฟล์: ${id}
  จำนวนความผิด: ${violations.length} ข้อ
  =====================================================
  ${violations.join('\n')}
  =====================================================
  🔧 แก้ไขซะนะ ไม่งั้นโดนจับอัดตูด😛😚🥵💦! 🔧
  =====================================================
          `
                    console.warn(summary)
                }
            }
        })
    }
})
