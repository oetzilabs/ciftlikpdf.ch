const Logo = (props: { small?: boolean }) => {
  const width = props.small ? 20 : 200;

  return <img src={props.small ? "/ciftlik-vakif-logo.webp" : "/ciftlik-logo-transparent.webp"} width={width} />;
};

export default Logo;
