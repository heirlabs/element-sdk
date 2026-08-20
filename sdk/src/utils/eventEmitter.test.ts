import { ElementEventEmitter } from './eventEmitter';

describe('ElementEventEmitter history', () => {
  let emitter: ElementEventEmitter;

  beforeEach(() => {
    emitter = new ElementEventEmitter();
  });

  describe('setMaxHistorySize', () => {
    const invalidSizes = [
      ['NaN', Number.NaN],
      ['Infinity', Number.POSITIVE_INFINITY],
      ['-Infinity', Number.NEGATIVE_INFINITY],
      ['negative integer', -1],
      ['negative float', -0.5],
      ['positive float', 1.5]
    ] as const;

    it.each(invalidSizes)('rejects %s', (_label, size) => {
      expect(() => emitter.setMaxHistorySize(size)).toThrow(TypeError);
      expect(() => emitter.setMaxHistorySize(size)).toThrow(
        /finite non-negative integer/
      );
    });

    it('accepts 0 and finite non-negative integers', () => {
      expect(() => emitter.setMaxHistorySize(0)).not.toThrow();
      expect(() => emitter.setMaxHistorySize(1)).not.toThrow();
      expect(() => emitter.setMaxHistorySize(100)).not.toThrow();
    });

    it('trims existing history when the cap is lowered', () => {
      emitter.emit('a', { n: 1 });
      emitter.emit('b', { n: 2 });
      emitter.emit('c', { n: 3 });

      emitter.setMaxHistorySize(2);

      const history = emitter.getHistory();
      expect(history).toHaveLength(2);
      expect(history.map((entry) => entry.event)).toEqual(['b', 'c']);
    });

    it('drops the oldest event once the emit cap is exceeded', () => {
      emitter.setMaxHistorySize(2);
      emitter.emit('a', 1);
      emitter.emit('b', 2);
      emitter.emit('c', 3);

      const history = emitter.getHistory();
      expect(history).toHaveLength(2);
      expect(history.map((entry) => entry.event)).toEqual(['b', 'c']);
    });
  });

  describe('getHistory', () => {
    it('defaults maxHistorySize to 100', () => {
      for (let i = 0; i < 101; i += 1) {
        emitter.emit('tick', i);
      }

      const history = emitter.getHistory();
      expect(history).toHaveLength(100);
      expect(history[0].data).toBe(1);
      expect(history[99].data).toBe(100);
    });

    it('returns isolated copies of stored records', () => {
      const payload = { value: 1 };
      emitter.emit('change', payload);

      const snapshot = emitter.getHistory();
      expect(snapshot).toHaveLength(1);
      expect(snapshot[0]).not.toBe(emitter.getHistory()[0]);

      snapshot[0].event = 'mutated';
      snapshot[0].data = { value: 99 };
      snapshot[0].timestamp = 0;
      snapshot.pop();

      const stored = emitter.getHistory();
      expect(stored).toHaveLength(1);
      expect(stored[0].event).toBe('change');
      expect(stored[0].data).toBe(payload);
      expect(stored[0].timestamp).not.toBe(0);
    });

    it('isolates filtered history records as well', () => {
      emitter.emit('keep', { id: 1 });
      emitter.emit('drop', { id: 2 });

      const filtered = emitter.getHistory('keep');
      expect(filtered).toHaveLength(1);
      filtered[0].event = 'mutated';
      filtered[0].data = { id: 9 };

      const stored = emitter.getHistory('keep');
      expect(stored).toHaveLength(1);
      expect(stored[0].event).toBe('keep');
      expect(stored[0].data).toEqual({ id: 1 });
    });
  });
});
