const Logo = (props: { small?: boolean; w?: number }) => {
  const width = props.small ? (props.w ? props.w : 20) : props.w ? props.w : 200;

  return <img src={props.small ? "/ciftlik-vakif-logo.webp" : "/ciftlik-logo-transparent.webp"} width={width} />;
};

export default Logo;
