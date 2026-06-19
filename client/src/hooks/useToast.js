import useToastStore from '../store/toastStore';

const useToast = () => {
  const store = useToastStore();
  return {
    success: store.success,
    error: store.error,
    info: store.info,
    warning: store.warning,
    custom: store.addToast,
  };
};

export default useToast;
