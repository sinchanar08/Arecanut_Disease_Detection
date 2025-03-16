import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Container,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Grid,
  TableContainer,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Button,
  CircularProgress,
  Paper,
} from "@material-ui/core";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { common } from "@material-ui/core/colors";
import { DropzoneArea } from "material-ui-dropzone";
import Clear from "@material-ui/icons/Clear";
import axios from "axios";

import cblogo from "./cblogo.png";
import bgImage from "./bg.png";

const ColorButton = withStyles((theme) => ({
  root: {
    color: theme.palette.getContrastText(common.white),
    backgroundColor: common.white,
    "&:hover": {
      backgroundColor: "#ffffff7a",
    },
  },
}))(Button);

const useStyles = makeStyles((theme) => ({
  grow: { flexGrow: 1 },
  clearButton: {
    width: "100%",
    borderRadius: "15px",
    padding: "15px 22px",
    color: "#000000a6",
    fontSize: "20px",
    fontWeight: 900,
  },
  root: { maxWidth: 345, flexGrow: 1 },
  media: { height: 400 },
  paper: { padding: theme.spacing(2), margin: "auto", maxWidth: 500 },
  gridContainer: { justifyContent: "center", padding: "4em 1em 0 1em" },
  mainContainer: {
    backgroundImage: `url(${bgImage})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "cover",
    height: "93vh",
    marginTop: "8px",
  },
  imageCard: {
    margin: "auto",
    maxWidth: 400,
    height: 500,
    backgroundColor: "transparent",
    boxShadow: "0px 9px 70px 0px rgb(0 0 0 / 30%)",
    borderRadius: "15px",
  },
  tableCell: {
    fontSize: "22px",
    color: "#000000a6",
    fontWeight: "bolder",
    padding: "1px 24px 1px 16px",
  },
  loader: { color: "#be6a77 !important" },
}));

export const ImageUpload = () => {
  const classes = useStyles();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/predict";

  const sendFile = async () => {
    if (!selectedFile) return;
    if (!API_URL) {
      setError("API URL is not configured. Please check your environment variables.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axios.post(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 && response.data) {
        setData(response.data);
      } else {
        throw new Error("Unexpected response from the server.");
      }
    } catch (err) {
      setError(err.response?.data?.message || `An error occurred: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onSelectFile = (files) => {
    if (!files || files.length === 0) {
      setSelectedFile(null);
      setPreview(null);
      setData(null);
      return;
    }
    const file = files[0];
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearData = () => {
    setSelectedFile(null);
    setPreview(null);
    setData(null);
    setError("");
  };

  useEffect(() => {
    if (selectedFile) sendFile();
  }, [selectedFile]);

  return (
    <React.Fragment>
      <AppBar position="static" className={classes.appbar}>
        <Toolbar>
          <Typography variant="h6" noWrap>Arecanut Disease Detection</Typography>
          <div className={classes.grow} />
          <Avatar src={cblogo} />
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} className={classes.mainContainer} disableGutters>
        <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2} className={classes.gridContainer}>
          <Grid item xs={12}>
            <Card className={classes.imageCard}>
              {preview ? (
                <CardActionArea>
                  <CardMedia className={classes.media} image={preview} component="img" title="Uploaded Image" />
                </CardActionArea>
              ) : (
                <CardContent>
                  <DropzoneArea acceptedFiles={["image/*"]} dropzoneText="Drag and drop an arecanut plant image to process" onChange={onSelectFile} />
                </CardContent>
              )}
              {isLoading && (
                <CardContent>
                  <CircularProgress color="secondary" className={classes.loader} />
                  <Typography variant="h6">Processing...</Typography>
                </CardContent>
              )}
              {error && (
                <CardContent>
                  <Typography color="error">{error}</Typography>
                </CardContent>
              )}
              {data && (
                <CardContent>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Result</TableCell>
                          <TableCell align="right">Confidence</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>{data.Class}</TableCell>
                          <TableCell align="right">{(parseFloat(data.Confidence) * 100).toFixed(2)}%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              )}
            </Card>
          </Grid>
          {data && (
            <Grid item>
              <ColorButton variant="contained" className={classes.clearButton} onClick={clearData} startIcon={<Clear />}>
                Clear
              </ColorButton>
            </Grid>
          )}
        </Grid>
      </Container>
    </React.Fragment>
  );
};
