/** Project tooling logger writes structured lifecycle events without raw process output helpers. */
export const logger = {
  /** @param {Readonly<Record<string,string|number>>} context Safe operational fields. @returns {void} */
  info(context) { process.stdout.write(JSON.stringify({level:'INFO',...context})+'\n'); },
  /** @param {string} event Stable event ID. @param {unknown} cause Internal failure. @returns {void} */
  error(event,cause) { process.stderr.write(JSON.stringify({level:'ERROR',event,errorType:cause instanceof Error?cause.name:'Unknown',stack:cause instanceof Error?cause.stack:undefined})+'\n'); },
};
