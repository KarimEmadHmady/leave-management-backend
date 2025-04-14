import User from "../models/User.js";

export const resetLeaveBalanceIfNeeded = async (user) => {
  const currentDate = new Date();
  const hireDate = new Date(user.hireDate);

  const oneYearDifference = currentDate - hireDate;
  const oneYearInMilliseconds = 365 * 24 * 60 * 60 * 1000;  

  if (oneYearDifference >= oneYearInMilliseconds) {
    user.leaveBalance.annual = 21;
    user.leaveBalance.sick = 10;
    user.leaveBalance.unpaid = 0;

    await user.save();
  }
};
