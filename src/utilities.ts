const success = (messageType: string, message: unknown) => {
  let messageText = messageType.toLowerCase();

  return { success: true, [messageText]: message };
};

const failure = (messageType: string, message: unknown) => {
  let messageText = messageType.toLowerCase();

  return { success: false, [messageText]: message };
};

export { success, failure };