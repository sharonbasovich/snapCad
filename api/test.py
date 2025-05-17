from gradio_client import Client, handle_file

client = Client("tencent/Hunyuan3D-2")
result = client.predict(
		caption=None,
		image=handle_file("C:/Personal/hackathons/jamhacks/api/test.png"),
		mv_image_front=None,
		mv_image_back=None,
		mv_image_left=None,
		mv_image_right=None,
		steps=30,
		guidance_scale=5,
		seed=1234,
		octree_resolution=256,
		check_box_rembg=True,
		num_chunks=8000,
		randomize_seed=True,
		api_name="/shape_generation"
)
print(result)
