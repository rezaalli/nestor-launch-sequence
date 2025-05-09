
// Event dispatcher for BLE events
export const dispatchBleEvent = (eventName: string, detail: any = {}) => {
  const event = new CustomEvent(eventName, { detail });
  window.dispatchEvent(event);
};
