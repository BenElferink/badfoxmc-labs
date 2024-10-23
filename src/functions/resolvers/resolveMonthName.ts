const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const resolveMonthName = (monthIndex: number | string) => {
  const num = Number(monthIndex);

  if (isNaN(num)) {
    return monthIndex;
  }

  return monthNames[num];
};

export default resolveMonthName;
