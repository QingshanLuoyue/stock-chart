import { createI18n } from '@/utils/i18n'

const messages = {
    '万': ['万', '萬', ''],
    '亿': ['亿', '億', ''],
    '万亿': ['万亿', '萬億', ''],
    fn: [val => `${val}%`, val => `${val}%`, val => `${val}%`]
}

export default createI18n(messages)
