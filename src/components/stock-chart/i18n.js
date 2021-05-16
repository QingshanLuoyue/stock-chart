import { createI18n } from '@/utils/i18n'

const messages = {
    '不复权': ['不复权', '不復權', 'Actual'],
    '前复权': ['前复权', '前復權', 'Adj Fwd'],
    '后复权': ['后复权', '後復權', 'Adj Bwd'],
    '1分': ['1分', '1分', '1 Min'],
    '分': ['分', '分', ' Min'],
    fn: [val => `${val}%`, val => `${val}%`, val => `${val}%`]
}

export default createI18n(messages)
