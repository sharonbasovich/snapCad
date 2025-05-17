import { Client, handle_file } from "@gradio/client";

const response = await fetch(
  "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png"
);
const exampleImage = await response.blob();

const client = await Client.connect("tencent/Hunyuan3D-2");
await client.view_api(); // see what inputs it expects — this is a must for debugging

const result = await client.predict("/shape_generation", {
  caption: null,
  image: handle_file(exampleImage),
  mv_image_front: null,
  mv_image_back: null,
  mv_image_left: null,
  mv_image_right: null,
  steps: 1,
  guidance_scale: 3,
  seed: 0,
  octree_resolution: 16,
  check_box_rembg: true,
  num_chunks: 1000,
  randomize_seed: true,
});

console.log(result.data);
