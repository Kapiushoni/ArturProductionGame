/** Expected a value after "=". */
export class WaitingForConstantError extends Error {
  constructor(fileName: string, message: string, line: number) {
    super(fileName + ':' + line + ': Expected Constant. ' + message + '.');
  }
}
