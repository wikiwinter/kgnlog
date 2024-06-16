import dayjs from 'dayjs'

const holidaysWithDates = [
    {
        name: 'NewYear',
        startDate: '01.12',
        endDate: '31.12',
        className: 'NewYear__bg',
    },
    {
        name: 'NewYear',
        startDate: '01.01',
        endDate: '31.01',
        className: 'NewYear__bg',
    },
]

export const getCurrentHoliday = () => {
    const currentDate = dayjs()
    for (let i = 0; i < holidaysWithDates.length; i++) {
        const startDate = dayjs(holidaysWithDates[i].startDate.concat(`.${dayjs().year()}`), 'DD.MM.YYYY')
        const endDate = dayjs(holidaysWithDates[i].endDate.concat(`.${dayjs().year()}`), 'DD.MM.YYYY')
        if (currentDate >= startDate && currentDate <= endDate) {
            return holidaysWithDates[i].className
        }
    }
    return ''
}
