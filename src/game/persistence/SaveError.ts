/** A saved item that can't be read. */
export class SaveError extends Error {
  constructor(message = '', _id = 0) {
    super(message);
  }
}
