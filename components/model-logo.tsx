import { Claude, Gemini, OpenAI } from '@lobehub/icons-rn';
import { useColorScheme } from "nativewind";
 

export const GeminiLogo = () => {
const { colorScheme } = useColorScheme();
return <Gemini.Combine color={colorScheme === 'dark' ? 'white' : 'black'} size={28} type={'color'} />;
}

export const OpenAILogo = () => {
    const { colorScheme } = useColorScheme()
return <OpenAI.Combine color={colorScheme === 'dark' ? 'white' : 'black'} size={30} iconProps={{ color: colorScheme === 'dark' ? 'white' : 'black' }} />;
}

export const ClaudeLogo = () => {
    const { colorScheme } = useColorScheme()
return <Claude.Combine color={colorScheme === 'dark' ? 'white' : 'black'} size={27} type={'color'}/>;
}
