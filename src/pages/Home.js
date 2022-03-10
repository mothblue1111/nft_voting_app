import React from 'react';
import {getNFTTokens} from '../service/web3';
import NFTItem from "../components/NFTItem";
import styled from 'styled-components';
import { Button, Stack, Grid, Box } from "@chakra-ui/react"
import {getVoters} from "../service/firestore";
const web3 = require('@solana/web3.js');
const {PublicKey} = require('@solana/web3.js');

const Home = () => {
    const [phantom, setPhantom] = React.useState(null);
    const [connected, setConnected] = React.useState(false);
    const [publicKey, setPublickKey] = React.useState(null);
    const [connection, setConnection] = React.useState(null);
    const [data, setData] = React.useState([]);
    const [isLoading, setLoading] = React.useState(false);
    const [voters, setVoters] = React.useState([]);

    React.useEffect(() => {
        setTimeout(() => {
            if (window.hasOwnProperty('solana')) {
                setPhantom(window["solana"]);
            }
        }, 100)
        getInitVoters();
    }, []);
    React.useEffect(() => {
        phantom?.on("connect", (res) => {
            setConnected(true);
            console.log('res--', res.toString())
            setPublickKey(res);
            getConnection()
        });

        phantom?.on("disconnect", () => {
            console.log('disconnect');
            setConnected(false);
            setPublickKey(null)
            setConnection(null)
        });
    }, [phantom]);

    const getInitVoters = async () => {
        const result = await getVoters();
        console.log('result---', result);
        setVoters([...result]);
    };

    const getInitNFTs = async () => {
        setLoading(true);
        const results = await getNFTTokens(new PublicKey(process.env.REACT_APP_WALLET_ADDRESS), connection)
        setData(results);
        setLoading(false);
    };

    const getConnection = () => {
        setConnection(new web3.Connection(
            process.env.REACT_APP_RPC_URL,
            'confirmed',
        ));
    };

    const connectPhantom = React.useCallback(() => {
        phantom.connect();
    }, [phantom]);

    const disconnectHandler = React.useCallback(() => {
        phantom?.disconnect();
    }, [phantom]);

    const getBalance = React.useCallback(async () => {
        if (!connection) return;
        let stakeBalance = await connection.getBalance(publicKey);
        console.log('balance--', stakeBalance)
    }, [connection, publicKey])

    const getTokens = React.useCallback(async () => {
        console.log(!connection || !publicKey);
        if (!connection || !publicKey) return;
        setLoading(true)
        const result = await getNFTTokens(publicKey, connection);
        console.log(result);
        setData(result)
        setLoading(false)
    }, [connection, publicKey])

    const RenderData = React.useCallback(() => {
        return  <div>
            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                {data.map(item => {
                    // console.log('item---', item.token, publicKey.toString())
                    if (item && item.uri) {
                        const vote = voters.find(v => v.publicKey === publicKey.toString() && v.mint === item.token);
                        return <Box sm={4} key={item?.uri} style={{marginTop: 30}}>
                            <NFTItem
                                data={item}
                                vote={vote}
                                voters={[...voters]}
                                publicKey={publicKey.toString()}
                                mint={item.token}
                                getInitVoters={getInitVoters}
                            />
                        </Box>
                    }
                    if (item && item.data.uri) {
                        const vote = voters.find(v => v.publicKey === publicKey.toString() && v.mint === item.data.token);
                        return <Box sm={4} key={item?.data?.uri} style={{marginTop: 30}}>
                            <NFTItem
                                data={item.data}
                                vote={vote}
                                voters={[...voters]}
                                publicKey={publicKey.toString()}
                                mint={item.token}
                                getInitVoters={getInitVoters}
                            />
                        </Box>
                    }
                    return <div key={item?.token}/>
                })}
            </Grid>
        </div>
    }, [data, voters])
    return <ContainerView>
        <Stack direction="row" spacing={4} align="flex-end">
            {(phantom && !connected) && <Button colorScheme="teal" variant="solid" onClick={connectPhantom}>
                Connect Phantom
            </Button>}
            {(phantom && connected) && <Button colorScheme="teal" variant="solid" onClick={disconnectHandler}>
                DisConnect Phantom
            </Button>}
            {!phantom && <a
                href="https://phantom.app/"
                target="_blank"
                className="bg-purple-500 px-4 py-2 border border-transparent rounded-md text-base font-medium text-white"
            >
                <Button colorScheme="teal" variant="solid">
                    Get Phantom
                </Button>
            </a>}
            {(phantom && connected) && <Button colorScheme="teal" variant="outline" onClick={getInitNFTs} isLoading={isLoading} loadingText="Getting NFTs" spinnerPlacement="end">
                Get Init NFTs
            </Button>}
            {/*{(phantom && connected) && <Button colorScheme="teal" variant="outline" onClick={getTokens}>*/}
            {/*    Get NFTs*/}
            {/*</Button>}*/}
        </Stack>
        {RenderData()}
    </ContainerView>
}
const ContainerView = styled.div`
  padding-top: 100px;
  padding-left: 20%;
  padding-right: 20%;
  flex:1;
`;

export default Home;
