/** A .di syntax error: "<file>:<line>: <message>." */
export class GenericError extends Error {
  constructor(fileName: string, message: string, line: number) {
    super(fileName + ':' + line + ': ' + message + '.');
  }
}
