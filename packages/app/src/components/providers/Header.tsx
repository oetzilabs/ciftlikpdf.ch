import { Accessor, JSX, Setter, createContext, createSignal, useContext } from "solid-js";
import { cn } from "../../utils/cn";

export const HeaderContext = createContext({
  visible: () => true,
  setVisible: () => {},
} as {
  visible: Accessor<boolean>;
  setVisible: Setter<boolean>;
});

export const Header = (props: { children: JSX.Element; header: JSX.Element }) => {
  const [visible, setVisible] = createSignal(true);
  return (
    <HeaderContext.Provider
      value={{
        visible,
        setVisible,
      }}
    >
      <nav
        class={cn(
          "flex items-center justify-between flex-wrap bg-white/[0.01] dark:bg-black/[0.01] border-b border-black/[0.05] dark:border-white/[0.02] fixed w-screen top-0 z-50 backdrop-blur-md py-2",
          {
            "hidden !h-0": !visible(),
          }
        )}
      >
        {props.header}
      </nav>
      {props.children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  return useContext(HeaderContext);
};
