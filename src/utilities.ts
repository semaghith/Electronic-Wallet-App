// const success = (messageType: string, message: unknown) => {
//   let messageText = messageType.toLowerCase();

//   return { success: true, [messageText]: message };
// };

const responseMessage = (data: object) => {
  return { success: true, ...data };
};

const failure = (message: string) => {
  return { success: false, message: message };
};

export { responseMessage, failure };