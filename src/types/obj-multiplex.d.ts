declare module 'obj-multiplex' {
  import {Duplex} from 'stream';

  type StreamObject = Duplex | NodeJS.ReadableStream | NodeJS.WritableStream;

  interface MultiplexOptions {
    /**
     * Set to true to use an ordered multiplex, where each stream is assigned a unique identifier.
     * Defaults to false.
     */
    ordered?: boolean;

    /**
     * Set to true to create new streams on the remote side automatically when a new stream is created on the local side.
     * Defaults to false.
     */
    allowHalfOpen?: boolean;
  }

  interface Multiplex extends Duplex {
    /**
     * Returns a new substream with a unique identifier.
     * The returned substream is a Duplex stream that can be used to send and receive data.
     */
    createStream(): Duplex;

    /**
     * Adds an existing stream to the multiplex as a substream with the specified identifier.
     * @param id A string identifier for the stream.
     * @param stream A readable or writable stream to add as a substream.
     */
    addStream(id: string, stream: StreamObject): void;

    /**
     * Removes a substream from the multiplex.
     * @param id The identifier of the substream to remove.
     */
    removeStream(id: string): void;

    /**
     * Returns true if a substream with the specified identifier exists in the multiplex.
     * @param id The identifier of the substream to check for.
     */
    hasStream(id: string): boolean;
  }

  /**
   * Create a new multiplex instance.
   * @param opts Multiplex options.
   * @returns A new Multiplex instance.
   */
  function createMultiplex(opts?: MultiplexOptions): Multiplex;

  export {Multiplex, StreamObject, MultiplexOptions, createMultiplex};
}
