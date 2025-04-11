# cf. https://github.com/noraworld/attendance

import datetime
import jpholiday
import json
import os
import re

DATE_DELIMITER_REGEXP = '[\/\-]'
DAY_OFF_JSON = 'day-off.json'
WEEKLY_OFF_DAYS = ['Saturday', 'Sunday']

class Util:
    def full_date(date_str):
        # '2022/05/20' -> [2022, 5, 20]
        # '2022/05/00' -> [2022, 5,  0]
        splitted_date = list(map(int, re.split(DATE_DELIMITER_REGEXP, date_str)))

        if len(splitted_date) != 3:
            raise ValueError('Invalid date format')

        # Let's say today is 2025/04/11
        # [2025, 4, 11] -> 2025
        # [   0, 4, 11] -> 2025
        if splitted_date[0] == 0:
            year = datetime.date.today().year
        else:
            year = splitted_date[0]

        # Let's say today is 2025/04/11
        # [2025, 4, 11] -> 4
        # [2025, 0, 11] -> 4
        if splitted_date[1] == 0:
            month = datetime.date.today().month
        else:
            month = splitted_date[1]

        # Let's say today is 2025/04/11
        # [2025, 4, 11] -> 11
        # [2025, 4,  0] -> 11
        if splitted_date[2] == 0:
            day = datetime.date.today().day
        else:
            day = splitted_date[2]

        return datetime.date(year, month, day)

class HolidayError(Exception):
    def __str__(self):
        return 'today is a holiday!'

class DayOffError(Exception):
    def __str__(self):
        return 'today is a day off!'

class WeeklyOffError(Exception):
    def __str__(self):
        return 'today is a weekly off!'

if __name__ == '__main__':
    if os.path.isfile(DAY_OFF_JSON):
        file = open(DAY_OFF_JSON)
        data = json.load(file)
        file.close()

        for day_off in data['day_off']:
            if datetime.date.today() == Util.full_date(day_off):
                raise DayOffError

    if jpholiday.is_holiday(datetime.date.today()) is True:
        raise HolidayError

    if (datetime.date.today().strftime('%A') in WEEKLY_OFF_DAYS) is True:
        raise WeeklyOffError
