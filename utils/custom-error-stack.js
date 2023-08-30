const generateCustomErrorStack = (stack) => {
  const lines = stack.split('\n');
  const [stackErrorMessage, ...fileLines] = lines.map((line) => line.trim());
  const customStackArray = [
    stackErrorMessage,
    ...fileLines.filter(
      (line) => line.startsWith('at file') || line.includes('file:')
    ),
  ];
  return customStackArray;
};

export { generateCustomErrorStack };
