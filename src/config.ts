const missingSetting = "Warning: No value set for this environmental value";

const config = {
    PORT: process.env.PORT || missingSetting,
};

export default config;
